use anyhow::{bail, Result};
use chrono::Utc;
use hmac::{Hmac, Mac};
use reqwest::{Client, Response};
use serde::de::DeserializeOwned;
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub struct RiotApiClient {
    client: Client,
    base_url: String,
    client_id: String,
    client_secret: String,
}

impl RiotApiClient {
    pub fn new(base_url: String, client_id: String, client_secret: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
            client_id,
            client_secret,
        }
    }

    /// Compute HMAC signature
    fn sign(&self, method: &str, endpoint: &str, body: &str, ts: i64) -> String {
        let canonical = format!("{}|{}|{}|{}", method.to_uppercase(), endpoint, ts, body);
        let mut mac = HmacSha256::new_from_slice(self.client_secret.as_bytes()).unwrap();
        mac.update(canonical.as_bytes());
        hex::encode(mac.finalize().into_bytes())
    }

    /// Ensure the response is successful, otherwise return an error with body.
    async fn ensure_success(response: Response) -> Result<Response> {
        let status = response.status();
        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "<empty>".to_string());
            bail!("HTTP error {status}: {body}");
        }
        Ok(response)
    }

    /// Post JSON and deserialize into `T`.
    pub async fn post_json<T: DeserializeOwned>(&self, endpoint: &str, region: &str) -> Result<T> {
        let ts = Utc::now().timestamp();
        let payload = serde_json::json!({ "endpoint": endpoint, "region": region });
        let body_str = serde_json::to_string(&payload)?;
        let sig = self.sign("POST", endpoint, &body_str, ts);

        let response = self
            .client
            .post(&self.base_url)
            .header("x-client-id", &self.client_id)
            .header("x-timestamp", ts.to_string())
            .header("x-signature", sig)
            .json(&payload)
            .send()
            .await?;

        let response = Self::ensure_success(response).await?;
        Ok(response.json::<T>().await?)
    }

    /// Post JSON and return raw body as string.
    pub async fn post_raw(&self, endpoint: &str, region: &str) -> Result<String> {
        let ts = Utc::now().timestamp();
        let payload = serde_json::json!({ "endpoint": endpoint, "region": region });
        let body_str = serde_json::to_string(&payload)?;
        let sig = self.sign("POST", endpoint, &body_str, ts);

        let response = self
            .client
            .post(&self.base_url)
            .header("x-client-id", &self.client_id)
            .header("x-timestamp", ts.to_string())
            .header("x-signature", sig)
            .json(&payload)
            .send()
            .await?;

        let response = Self::ensure_success(response).await?;
        Ok(response.text().await?)
    }
}
