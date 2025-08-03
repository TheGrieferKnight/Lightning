use reqwest::{self};
use std::path::PathBuf;
use tauri::Manager;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

async fn download_image(
    app: &tauri::AppHandle,
    url: &str,
    filename: &str,
    subfolder: &str,
) -> Result<(), String> {
    let full_url = format!("{url}{filename}");
    let response = reqwest::get(full_url)
        .await
        .map_err(|e| format!("Failed: {e}"))?;
    let bytes = response.bytes().await.map_err(|e| format!("Failed: {e}"))?;

    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to save PUUID: {e}"))?;

    let full_path = app_data_dir.join(format!("assets/{subfolder}/{filename}"));

    let mut file = File::create(full_path).await.unwrap();
    file.write_all(&bytes).await.unwrap();

    println!("Downloaded image: {filename}");
    Ok(())
}

#[tauri::command]
pub async fn get_image_path(app: tauri::AppHandle, name: &str) -> Result<String, String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to save PUUID: {e}"))?;

    let full_path = format!(
        "{}/assets/summoner_spells/{}.png",
        app_data_dir.into_os_string().into_string().unwrap(),
        name
    );
    Ok(full_path)
}

#[tauri::command]
pub async fn mains(app: tauri::AppHandle) {
    let url = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/spell/";
    let filenames = [
        "SummonerBarrier.png",
        "SummonerBoost.png",
        "SummonerCherryFlash.png",
        "SummonerCherryHold.png",
        "SummonerDot.png",
        "SummonerExhaust.png",
        "SummonerFlash.png",
        "SummonerHaste.png",
        "SummonerHeal.png",
        "SummonerMana.png",
        "SummonerPoroRecall.png",
        "SummonerPoroThrow.png",
        "SummonerSmite.png",
        "SummonerSnowURFSnowball_Mark.png",
        "SummonerSnowball.png",
        "SummonerTeleport.png",
        "Summoner_UltBookPlaceholder.png",
        "Summoner_UltBookSmitePlaceholder.png",
    ];
    let subfolder: &str = "summoner_spells";
    for filename in filenames {
        let _ = download_image(&app, url, filename, subfolder).await;
    }

    let url = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/champion/";
    let filenames = [
        "Annie.png",
        "Olaf.png",
        "Galio.png",
        "TwistedFate.png",
        "XinZhao.png",
        "Urgot.png",
        "LeBlanc.png",
        "Vladimir.png",
        "Fiddlesticks.png",
        "Kayle.png",
        "MasterYi.png",
        "Alistar.png",
        "Ryze.png",
        "Sion.png",
        "Sivir.png",
        "Soraka.png",
        "Teemo.png",
        "Tristana.png",
        "Warwick.png",
        "Nunu.png",
        "MissFortune.png",
        "Ashe.png",
        "Tryndamere.png",
        "Jax.png",
        "Morgana.png",
        "Zilean.png",
        "Singed.png",
        "Evelynn.png",
        "Twitch.png",
        "Karthus.png",
        "ChoGath.png",
        "Amumu.png",
        "Rammus.png",
        "Anivia.png",
        "Shaco.png",
        "DrMundo.png",
        "Sona.png",
        "Kassadin.png",
        "Irelia.png",
        "Janna.png",
        "Gangplank.png",
        "Corki.png",
        "Karma.png",
        "Taric.png",
        "Veigar.png",
        "Trundle.png",
        "Swain.png",
        "Caitlyn.png",
        "Blitzcrank.png",
        "Malphite.png",
        "Katarina.png",
        "Nocturne.png",
        "Maokai.png",
        "Renekton.png",
        "JarvanIV.png",
        "Elise.png",
        "Orianna.png",
        "Wukong.png",
        "Brand.png",
        "LeeSin.png",
        "Vayne.png",
        "Rumble.png",
        "Cassiopeia.png",
        "Skarner.png",
        "Heimerdinger.png",
        "Nasus.png",
        "Nidalee.png",
        "Udyr.png",
        "Poppy.png",
        "Gragas.png",
        "Pantheon.png",
        "Ezreal.png",
        "Mordekaiser.png",
        "Yorick.png",
        "Akali.png",
        "Kennen.png",
        "Garen.png",
        "Leona.png",
        "Malzahar.png",
        "Talon.png",
        "Riven.png",
        "KogMaw.png",
        "Shen.png",
        "Lux.png",
        "Xerath.png",
        "Shyvana.png",
        "Ahri.png",
        "Graves.png",
        "Fizz.png",
        "Volibear.png",
        "Rengar.png",
        "Varus.png",
        "Nautilus.png",
        "Viktor.png",
        "Sejuani.png",
        "Fiora.png",
        "Ziggs.png",
        "Lulu.png",
        "Draven.png",
        "Hecarim.png",
        "KhaZix.png",
        "Darius.png",
        "Jayce.png",
        "Lissandra.png",
        "Diana.png",
        "Quinn.png",
        "Syndra.png",
        "AurelionSol.png",
        "Kayn.png",
        "Zoe.png",
        "Zyra.png",
        "KaiSa.png",
        "Seraphine.png",
        "Gnar.png",
        "Zac.png",
        "Yasuo.png",
        "VelKoz.png",
        "Taliyah.png",
        "Camille.png",
        "Akshan.png",
        "BelVeth.png",
        "Braum.png",
        "Jhin.png",
        "Kindred.png",
        "Zeri.png",
        "Jinx.png",
        "TahmKench.png",
        "Briar.png",
        "Viego.png",
        "Senna.png",
        "Lucian.png",
        "Zed.png",
        "Kled.png",
        "Ekko.png",
        "Qiyana.png",
        "Vi.png",
        "Aatrox.png",
        "Nami.png",
        "Azir.png",
        "Yuumi.png",
        "Samira.png",
        "Thresh.png",
        "Illaoi.png",
        "RekSai.png",
        "Ivern.png",
        "Kalista.png",
        "Bard.png",
        "Rakan.png",
        "Xayah.png",
        "Ornn.png",
        "Sylas.png",
        "Neeko.png",
        "Aphelios.png",
        "Rell.png",
        "Pyke.png",
        "Vex.png",
        "Yone.png",
        "Ambessa.png",
        "Mel.png",
        "Yunara.png",
        "Sett.png",
        "Lillia.png",
        "Gwen.png",
        "RenataGlasc.png",
        "Aurora.png",
        "Nilah.png",
        "KSante.png",
        "Smolder.png",
        "Milio.png",
        "Hwei.png",
        "Naafiri.png",
    ];
    let subfolder: &str = "champion_square";
    for filename in filenames {
        let _ = download_image(&app, url, filename, subfolder).await;
    }
}
