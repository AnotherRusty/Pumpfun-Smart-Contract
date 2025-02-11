FROM gitpod/workspace-full

RUN rustup default 1.79 &&\
    sudo apt-get install -yq \
        build-essential \
        pkg-config \
        libudev-dev llvm libclang-dev \
        protobuf-compiler libssl-dev &&\
    sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.23/install)" &&\
    export "PATH=${PATH}:${HOME}/.local/share/solana/install/active_release/bin" &&\
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force &&\
    avm install latest &&\
    avm use latest &&\
    printf 'export PATH="${PATH}:%s"\n' "${HOME}/.local/share/solana/install/active_release/bin" >> ${HOME}/.bashrc &&\
    printf 'export PATH="${PATH}:%s"\n' "${HOME}/.avm/bin" >> ${HOME}/.bashrc
