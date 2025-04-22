FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Etc/UTC

RUN apt-get update && \
    apt-get install -y \
    openssh-server \
    git \
    curl \
    tzdata && \
    ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    mkdir /var/run/sshd && \
    useradd -m -s /usr/bin/git-shell git && \
    mkdir -p /home/git/.ssh && \
    chmod 700 /home/git/.ssh && \
    # 🔧 Fix SSH config for key-based Git access
    sed -i \
    -e 's/#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' \
    -e 's/#\?PasswordAuthentication.*/PasswordAuthentication no/' \
    -e 's|#\?AuthorizedKeysFile.*|AuthorizedKeysFile .ssh/authorized_keys|' \
    /etc/ssh/sshd_config

COPY init.sh /usr/local/bin/init-git-server.sh
RUN chmod +x /usr/local/bin/init-git-server.sh

EXPOSE 22

CMD ["/usr/local/bin/init-git-server.sh"]
