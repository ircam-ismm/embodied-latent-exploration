# Embodied exploration of deep latent spaces using hands positions tracking with MediaPipe

Here, we propose new MaxMSP patches to use the embodied interactions strategies introduced in our paper with hands position tracking instead of R-IoTs IMU sensors initially used. To do so, we rely on [MediaPipe](https://github.com/google-ai-edge/mediapipe) with Max's javascript object `jweb` connected to a live webcamera stream.
We have cloned the [`jweb-hands-landmarker` github repository](https://github.com/lysdexic-audio/jweb-hands-landmarker.git) in this repository for this tutorial.

## Launch MediaPipe hands positions tracking

1. Open MaxMSP and in "`Options > File Preferences ...`" add the absolute path to `./embodied-latent-exploration/code/mediapipe-hands-landmarks/jweb-hands-landmarker`directory.

2. Open the `jweb-hands-landmarker_send_data.maxpat` patch in Max.


## Usage

The first 2 embodied interactions (I1 and I2) adpated to work with fingers positions using mediapipe can be found in the directory `./embodied-latent-exploration/code/mediapipe-hands-landmarks/` where we have the following patches:
- `interaction1_direct_motion_exploration_mediapipe.maxpat`
- `interaction2_local_exploration_distort_audio_samples_mediapipe.maxpat`

It is exactly the same usage as with the R-IoTs, we simply replaced the `riotbitalino` Max object with the left and right x and y index fingers positions. Please, refer to the tutorial videos for more details.

*The third interaction strategy I3 is not available yet.*
