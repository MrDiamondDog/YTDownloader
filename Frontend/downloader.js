const ytdl = require('ytdl-core');
const fs = require('fs');
const {ipcRenderer} = require('electron');

const Elements = {
    "DownloadButton": document.getElementById("DownloadButton"),
    "LinkInput": document.getElementById("LinkInput"),
    "DownloadText": document.getElementById("DownloadText"),
    "VideoTypeSelector": document.getElementById("VideoTypeSelector"),
    "InfoText": document.getElementById("Info")
}

function Update(){
    const LinkValid = CheckValidYouTubeLink(Elements.LinkInput.value);
    const Ready = (LinkValid && VideoTypeSelector.value != "");
    Elements.DownloadButton.disabled = Ready ? false : true;

    if (!LinkValid && Elements.LinkInput.value != ""){
        Elements.InfoText.innerText = "Invalid YouTube Link";
        Elements.InfoText.hidden = false;
        Elements.InfoText.style.color = "red";
    } else if (LinkValid){
        ytdl.getInfo(Elements.LinkInput.value).then(info => {
            Elements.InfoText.innerText = info.videoDetails.title;
            Elements.InfoText.hidden = false;
            Elements.InfoText.style.color = "white";
        });
    }
}

setInterval(Update, 100);

Elements.DownloadButton.addEventListener("click", Download);

async function Download(){
    const Link = Elements.LinkInput.value;
    const VideoType = Elements.VideoTypeSelector.value;
    const Info = await ytdl.getInfo(Link);
    const VideoQuality = "highest";
    const AudioQuality = "highest";

    if (VideoType.startsWith("Video")){
        const video = ytdl(Link, {
            quality: VideoQuality
        });
        var videoName = "";
        if (VideoType == "Video-MP4"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".mp4";
        } else if (VideoType == "Video-MOV"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".mov";
        }
        const filePath = await ipcRenderer.invoke("filePathPrompt", videoName);
        if (filePath == undefined){
            return;
        }
        video.pipe(fs.createWriteStream(filePath));
    }

    if (VideoType.startsWith("Audio")){
        const video = ytdl(Link, {
            quality: AudioQuality
        });
        var videoName = "";
        if (VideoType == "Audio-MP3"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".mp3";
        } else if (VideoType == "Audio-M4A"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".m4a";
        } else if (VideoType == "Audio-WAV"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".wav";
        } else if (VideoType == "Audio-OGG"){
            videoName = Info.videoDetails.title.replace(/[^\w\s]/gi, '') + ".ogg";
        }
        const filePath = await ipcRenderer.invoke("filePathPrompt", videoName);
        if (filePath == undefined){
            return;
        }
        video.pipe(fs.createWriteStream(filePath));
    }
}

function CheckValidYouTubeLink(url){
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return true;
    }
    return false;
}