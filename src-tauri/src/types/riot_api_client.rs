use anyhow::{bail, Result};
use reqwest::{Client, Response};
use serde::de::DeserializeOwned;

pub struct RiotApiClient {
    client: Client,
    base_url: &'static str,
    bypass_token: &'static str,
}

impl RiotApiClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot",
            bypass_token: "4gSz0EXtXJyTt7cxfCCH46mlH24t1J6l",
        }
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
    pub async fn post_json<T: DeserializeOwned>(&self, payload: serde_json::Value) -> Result<T> {
        let response = self
            .client
            .post(self.base_url)
            .header("x-vercel-protection-bypass", self.bypass_token)
            .json(&payload)
            .send()
            .await?;

        let response = Self::ensure_success(response).await?;
        Ok(response.json::<T>().await?)
    }

    /// Post JSON and return raw body as string.
    pub async fn post_raw(&self, payload: serde_json::Value) -> Result<String> {
        let response = self
            .client
            .post(self.base_url)
            .header("x-vercel-protection-bypass", self.bypass_token)
            .json(&payload)
            .send()
            .await?;

        let response = Self::ensure_success(response).await?;
        Ok(response.text().await?)
    }
}
