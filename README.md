# Embodied exploration of deep latent spaces in interactive dance-music performance

This repository is linked to our paper submission to the [MOCO'24](https://moco24.movementcomputing.org/) Conference on Movement and Computing. Please, visit our [GitHub page](https://ircam-ismm.github.io/embodied-latent-exploration/) for supplementary materials with examples.

In this work, we investigate the use of deep audio generative models in interactive dance/music performance. We introduce a motion-sound interactive system integrating deep audio generative model and propose three embodied interaction methods to explore deep audio latent spaces through movements. Please, refer to the paper for further details.



***The source code will be fully released with demo-tutorials after the paper reviews. For now, we simply provide an overview of the patch for each interaction method in the [Usage](#usage) section.***


## Install and requirements

Our motion-sound interactive system implemented in Max/MSP. 

First, you need to install the required dependencies.

We used [R-IoT](https://ismm.ircam.fr/riot/) IMU motion sensors composed of accelerometers and gyroscopes with the [MuBu](https://ismm.ircam.fr/mubu/) library and the [Gestural toolkit](https://github.com/ircam-ismm/Gestural-Sound-Toolkit) for real-time motion capture and analysis. 

For deep audio generation, we relied on the [RAVE](https://github.com/acids-ircam/RAVE) model which enables fast and high-quality audio waveform synthesis in real-time on standard laptop CPU, and we used the [nn_tilde](https://github.com/acids-ircam/nn_tilde) external to import our pre-trained RAVE models in Max/MSP. 

You can download pre-trained RAVE models in [here](https://acids-ircam.github.io/rave_models_download).

## Usage 

### Interaction I1: direct motion exploration

![interaction1](./docs/assets/img/interaction1.png)

### Interaction I2: local exploration around existing latent trajectories

![interaction2](./docs/assets/img/interaction2.png)


### Interaction I3: implicit mapping between motion descriptors and latent trajectories

- First, do the *training phase*: synchronously record movement with sound to temporally-aligned both signals features and train the HMR model to capture the implicit movement-sound relationship.

![interaction3_train](./docs/assets/img/interaction3_train.png)

- Second, do the *performance phase*: select the HMR model and activate the RAVE synthesis decoder for inference.

![interaction3_inference](./docs/assets/img/interaction3_inference.png)



## Acknowledgments

Removed for anonymous submission
