FROM debian:bookworm-slim

# Avoid tzdata asking for region during install
ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Etc/UTC

RUN apt-get update && \
    apt-get install -y \
    openssh-server \
    git \
    tzdata && \
    ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    mkdir /var/run/sshd && \
    useradd -m -s /usr/bin/git-shell git && \
    mkdir -p /home/git/.ssh && \
    chmod 700 /home/git/.ssh

COPY init.sh /usr/local/bin/init-git-server.sh
RUN chmod +x /usr/local/bin/init-git-server.sh

EXPOSE 22

CMD ["/usr/local/bin/init-git-server.sh"]
