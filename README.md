# 🎬 ReelHerbs Extension

ReelHerbs is a powerful extension designed to enhance your workflow. It provides seamless functionality and an intuitive user experience.

## 📺 Demo Video

Watch the video below to see how ReelHerbs works in action. The video demonstrates the auto-scroll feature and highlights how the extension limits scrolling to the relevant sections for a smoother experience.
<video src="./ReelHerbs_video.gif" autoplay muted loop width="640" height="360"></video>

## 🚀 How to Launch the Extension

1. Press `Ctrl + Shift + P` to open the Command Palette.
2. Search for **ReelHerbs** in the Command Palette.
3. Select the extension to launch it.

## ✨ Features

- **Auto Scroll and Manual Scroll**: The extension automatically scrolls to the relevant section, so you don't need to manually scroll to the next of the video.
- If you want Manual scroll it also want. Click on the Button **`Scroll Reel`**

- **Video-Triggered Scroll**: Once the video finishes playing, the extension will automatically scroll to the next relevant section for a seamless experience.

- **Keyboard and Button Controls**: Click on the button **`Scroll Reel`** to start the reel. Use the **`Down`** and **`Up`** arrow keys to scroll through the content manually.

## 📝 Version History

- v0.0.1 (Initial Demo Release): First launch of ReelHerbs.
Showcased basic reel scrolling and video playback.

- v0.1.1 (Main Release): Added Auto Scroll support (smooth snap between reels).Fixed audio autoplay block issue → now audio plays seamlessly without user interaction problems.
Improved UI responsiveness for smoother reel transitions.

- v1.0.0: Added extra video

Enjoy using ReelHerbs to streamline your tasks!

## 🛠️ How to Use This Extension

- Create two folders in your project directory:
  - `videos` → place your video files (`.mp4`) here  
  - `audios` → place your audio files (`.mp3`) here
  - if folder not found then make then put the things 

### 1. Organize Your Media Files
- Place your video files (`.mp4`) and audio files (`.mp3`) in the designated folder of your project.

### 2. Update in `video_data.json` and `Extension.js`
- Open the `video_data.json` file in your project.
- Update the `video_file` and `audio_file` fields for each entry to match your media files. Example:

```json
{
  "video_file": "video_name.mp4",
  "audio_file": "audio_name.mp3"
}
```

- Remove this `**${extraCard}**`

```js
if (item.audioUri && item.videoUri) {
            return `
        <div class="card" data-audio="${item.audioUri}">
            <video  muted class="reel-video">
                <source src="${item.videoUri}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        ${extraCard}
    `;
}
```
- `**if code not work message me**`