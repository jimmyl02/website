---
layout: ../../layouts/PostLayout.astro
title: DiceCTF 2022 in Review
date: Feb 21, 2022
description: "Review of running DiceCTF 2022 as an organizer."
tags: [DiceCTF]
featured: true
---

### Introduction

First blog post in a while! I wanted to do a postmortem of DiceCTF which ran the past weekend (2/4/22-2/6/22) as we did a lot of things right but still had much we could improve on. I've also successfully poached ginkoid and asphyxia to add a lot of really insightful technical details around our infrastructure. We've wanted to do an infrastructure write-up for a long time and with all that went on with DiceCTF this felt like the perfect time to do it. In general, this blog post this will be from the perspective of someone handling the logistics and infrastructure side more so than the challenges side. Hopefully this offers an interesting read and some insight into what it takes to organize an event like DiceCTF.

### Overview

The infrastructure team behind DiceCTF is the same as redpwnCTF and consists of members from redpwn. For DiceCTF, most of the infrastructure was handled by [ginkoid](https://twitter.com/ginkoid) and [asphyxia](https://ethanwu.dev/). I tried my best to help out when I could and also bridge the gap between logistics and the technical side. Besides redpwnCTF 2020 where we first introduced our modern infrastructure stack, this CTF was probably the most hectic for our small (but powerful) infra team.

Here are some of the difficulties we had to deal with which provides some insight into why this iteration was "rough sailing": new deployment infrastructure with terraform based deployment instead of [rCDS](https://github.com/redpwn/rcds/), complex challenges that required specialized deployments, and overall being rushed due to starting preparation a bit too late.

To give some insight into the scale of DiceCTF here are some stats about our infrastructure: during this weekend we had over 1100 teams, 15k players, and supported 42 challenges with over 160 GB of total network traffic. These are no small numbers and to support this it took a lot of work behind the scenes! This blog post will go over all aspects of this, starting with [my experiences and managing logistics](#anecdotes-throughout-the-ctf) then diving more into the [technical side of our infrastructure](#technologies-behind-the-infrastructure).

### Anecdotes Throughout the CTF

This section will go over my experiences throughout the CTF and the various logistical and developmental tasks I had to balance. It will not be as formal as the following technical section so you can feel the exact roller coaster of emotions we went through. Overall my goal with this section is to illustrate the behind the scenes complexities involved with running a CTF.

#### Lead Up to the CTF

There are a lot of tasks to accomplish before any CTF and that is no different for DiceCTF. Generally it can be split into challenge development and infrastructure. Although this seems simple, there is actually a lot to do on both sides. Originally I had intended to release a challenge but things outside of CTF caught up to me and I ran out of time. Challenge development really isn't easy and I believe you gain a true appreciation for other challenge authors after writing your own. Instead of challenge writing, I took up a more management focused role to make sure the overall event went as smoothly as possible.

Around 1 week before the start it was time to make a semi-final-draft of our challenges. It was at this point we realized there was actually a challenge imbalance. We began discussing some options to deal with this including potentially weighting the categories differently (so one team couldn't just solve only crypto and win) or releasing less challenges to line up with the other categories. However, we later found that other authors had challenges that just weren't being tracked so the disparity didn't end up being that big of a problem. However, this did cause us to start chasing authors down and diligently tracking our challenges in our spreadsheet. The following is what our final spreadsheet looks like; it is cleaned up and did not look nearly like this at the start but shows how we track our challenges.

![challenge list spreadsheet](https://blog.jimmyli.us/img/posts/dicectf22-in-review/chall_list.png)

The green color coding means that the challenges were tested on remote. At this point our spreadsheet was far from green and we didn't feel an immense pressure to chase down authors and get test solves in. This was something we would regret as we got closer to the start of the CTF.

In addition to managing our challenges, I was tasked with setting up packet logging infrastructure to give us more insights into our network traffic. This will be explained a lot more in the further down technical section but the purpose is to store traffic. At the same time, asphyxia was working on another important piece of infrastructure, a firecracker system, for one specific challenge as well as a longer term vision. As we are roommates, it is fun because we get to see each other's progress as well as stress due to the deadline approaching. Other smaller tasks like setting up rctf blood watch and the ticket bot were handled during the period as well. They were nice smaller breaks from our larger deadlines but finishing them this early helped alleviate pressure later.

#### The Hour Before Start

The hour before the CTF was probably the most hectic as there was so much to be done, not much time, and asphyxia and I had to go to an in-person discussion section so 2/3 of our infra team was at half availability. My personal tasks were to schedule the challenges to release at the start and prepare our announcement messages. Due to some problems which broke our deployment pipeline it was slow to test and fix challenges for authors to test. This resulted in us having to push back a good amount of our challenges to the +12 hour wave of releases. Due to the amount of challenges we pushed back, we then made a decision to add a +6 hour wave to give us some more time to fix and deploy challenges. This was a critical decision and although made in a short amount of time, had a pretty large impact. The following is what our challenge release sheet looks like, keep in mind that during this time the sheet was in much more disarray. A lot of the green in the first 12 hour waves were yellow or red.

![challenge schedule spreadsheet](https://blog.jimmyli.us/img/posts/dicectf22-in-review/chall_schedule.png)

At this point we had tested and known which challenges we wanted to start the CTF with. I began drafting the announcement message while ginkoid and asphyxia worked on preparing the challenge infrastructure. One downside of our infrastructure all being on terraform is slower deployment times due to the nature of terraform. This meant dropping our firewall was stressful because it was very close to the start of the CTF. Furthermore, our challenge deploy terraform was breaking due to some errors in our image build pipeline. The challenge deploy terraform not only handles deploying the challenges but also what is displayed on rCTF which is our CTF platform. Due to this we decided to manually delete challenges from rCTF via the admin dashboard. This is something that is strictly reserved for emergencies as it breaks our deployment pipeline but we had no choice due to the CTF starting in 3 minutes. With this, I saw the glorious scene of asphyxia deleting challenges from our unpolished rCTF admin panel in the back left corner of our discussion section as I fixed typos and added correct information to the announcement message.

Finally, at the moment the CTF started, somewhat surprisingly nothing catastrophic happened. It had gotten to the point where I seriously brought up delaying the start of the CTF which is something you almost never want to hear yet somehow we had started on time. Our discussion section ended right at the time the CTF started so we headed to the OCF lab on campus to continue monitoring the infrastructure. This is what the monitoring setup looked like at the OCF.

![ocf challenge monitor](https://blog.jimmyli.us/img/posts/dicectf22-in-review/ocf_monitor.jpg)

#### Rest of the CTF

For the first 6 hours I was chasing down challenge authors to finish their challenges as well as run their test solves against remote. This was not a complex task but just time consuming and was a result of not starting this process earlier. In addition to getting updates on our challenges, we also had to deal with deployment issues when updating challenges. Various issues like authors editing challenges causing our build pipeline to fail and slightly erroneous challenge configurations caused some issues but were all resolved with some effort. It was also during this time that we started working on the fixing the problems with the more complex to deploy challenges, namely the 5dfs and cache-on-the-side challenges.

We had originally intended to release these challenges at the 6 hour mark but couldn't figure out all the deployment problems in time. Instead, we released all the other challenges for the wave on time and moved these 2 challenges to the 12 hour wave. This gave us another opportunity to fix them without delaying a release wave. Most of the infrastructure people were working tirelessly on getting these working and as it approached midnight we realized we were very close but not finalized on being able to deploy the challenges. We then made a decision to delay the wave as there were still many unsolved challenges and we wanted to give players enough time to work on these two challenges. Finally, at around 3 am PST, we were able to deploy both the cache-on-the-side challenge and 5dfs. It was exhausting and time consuming but also rewarding in its own right. We were able to solve a massive hurdle in which I learned a lot from a technical perspective and were also able to give players more time to try out the neat challenges.

After this wave, the rest of the CTF was quite smooth from a logistics and infrastructure perspective. Many problems were quickly resolved because our deployment pipeline had been fixed and all infrastructure people were free to help with problems instead of being occupied with challenges. It was kind of an odd feeling because everything was so automated that there was almost nothing to do. This is more akin to what running past iterations of DiceCTF and redpwnCTF felt like and is due in no small part to the awesome technical work of ginkoid and asphyxia. The next section does a deeper dive into the technical elements of the infrastructure and what it takes to make it a seamless experience for both organizers and players during the CTF.

### Technologies Behind The Infrastructure

The following portion of this post will dive deeply into the various parts of our infrastructure, how we set them up, and our experiences with it during the CTF. It takes a lot to ensure the infrastructure is both stable and secure, especially when the target audience is some of the best security experts in the world. I've also learned a lot from seeing ginkoid and asphyxia work on this so I'm really glad we can share what the full infrastructure stack looks like.

#### Challenge Deployments

The general infrastructure we've adopted to run our challenges on is kubernetes. There are many advantages kubernetes brings such as easy deployments with the correct manifests, auto-healing in case a challenge goes down, and containerization. Previously we used a tool called [rCDS](https://github.com/redpwn/rcds) to generate and apply manifests to a kubernetes cluster. This tool also integrates with our ctf platform [rCTF](https://github.com/redpwn/rctf). For DiceCTF22 we migrated to a new terraform based system for deployment which is what we will be looking at.

Terraform is a tool which lets you write declarative code in HCL that then automatically provisions the required cloud infrastructure. One example is that I can say I wanted a GCS bucket named "cool-bucket" in HCL then after applying the terraform, I will have a bucket named "cool-bucket" in my GCP project. In addition to just deploying resources, we can also use a kubernetes provider to manage kubernetes services using terraform.

You might be asking why we would use a tool like Terraform to manage our challenges. One overlooked benefit of Terraform is that it helps track the state of the project and can decide when to add or delete resources automatically. We wanted to capitalize on this and try out the new system this year.

We stored all challenges and Terraform configuration in a single monorepo. On every repo push, we built Docker images for every challenge in GitHub Actions and pushed them to Google Container Registry. We are working on a public release of the core infrastructure and it will be published on the [DiceGang Github](https://github.com/dicegang/).

For TCP challenges, we used Google network load balancers with a Kubernetes `NodePort` service for each challenge. For HTTP challenges, we used Traefik along with a Kubernetes service and ingress for each challenge. Traefik handled TLS termination and routing for all challenges.

Ginkoid was primarily in charge of challenge deployments, if you have any questions about this feel free to reach out!

#### Packet Logging

This year we wanted to log the traffic into and out of our network so we could have more insights into what competitors were doing. We decided the easiest way to accomplish this was to have GCP handle it for us via VPC traffic mirroring on our challenges VPC then log the traffic.

A VPC within GCP is like a separate network. For our challenge deployments, we have a VPC named "challenges" which contains all of our kubernetes nodes that handle challenges. All traffic to the challenges would go through this VPC so if we could just get a copy of all this traffic to log it would be perfect. This is where Packet Mirroring comes into play. Packet Mirroring is a built in service within GCP which allows you to mirror all traffic from one subnet of a VPC to another subnet. This image is from the [official documentation](https://cloud.google.com/vpc/docs/packet-mirroring#same-network) but explains most of what is happening.

![VPC mirroring overview](https://blog.jimmyli.us/img/posts/dicectf22-in-review/vpc_mirror.png)

To activate VPC mirroring we must create a new subnet on the same VPC, a load balancer to receive the mirrored traffic, a GCE instance to handle the traffic, an instance group to receive traffic from the load balancer, and a packet mirroring policy. This could be done via terraform but to speed up implementation I just did it via GCP platform.

After creating the mirroring policy above, the GCE instance would receive all traffic sent to the challenge cluster via its network card. To capture the traffic and transfer it to pcap we used tcpdump. We expected a lot of traffic, more than 50GB a day, so we created a rotation system to rotate pcaps by storing then deleting older generated files. tcpdump has a built in argument to handle this and the following command is what we used.

`tcpdump -i ens4 -C 1000 -W 40 -w dump.pcap`

This command tells tcpdump to listen on the ens4 interface, generate 1GB pcaps, and rotate across 40 different files. What will happen is after the 1GB file is generated tcpdump will start writing into a different file. In order to store the generated pcaps we wrote a go program that listens for file changes via fsnotify and if we new file was being written to, we upload the previously written file to a GCS bucket. The code for this can all be found in the github repository [here](https://github.com/jimmyl02/pcap_uploader).

We found that this system worked well and could handle all the challenge traffic we received. In the end we received over 160GB of network traffic all stored in a GCS bucket. One downside with this setup was internal traffic between nodes wasn't being captured despite enabling intranode visibility or we made a mistake in setup somewhere. We aren't sure exactly what went wrong but this made logging HTTPS traffic not work as all the traffic was encrypted. This is something we will definitely investigate for next time.

#### Firecracker

One new piece of infrastructure for this year is a new TCP server for running challenges in a [Firecracker][firecracker]-based microVM. We previously didn't have any standardized infrastructure for running any challenges needing a full kernel (last time we ran kernel pwn, we set up a separate server with qemu and xinetd manually). In addition, we wanted to run FUSE challenges this year (5DFS), and we didn't want to expose `/dev/fuse` to vulnerable challenge containers. So, we sought to create a new system to run challenges within their own isolated Firecracker microVMs, with a similar same UX as our existing sandboxing solution, [`redpwn/jail`][redpwnjail]. To deploy a challenge in a VM, all we need to do is run an intermediate build step to package up the container into a ramfs image:

```dockerfile
FROM ubuntu:focal AS runtime
RUN apt update && apt install -y python3 fuse
WORKDIR /home/ctf
COPY 5dfswmtt setup.sh flag ./

FROM runtime AS ramfs-builder
RUN --mount=type=bind,from=firecracker-ramfs-builder,target=/firejail /firejail/build

FROM firecracker-server AS run
COPY --from=ramfs-builder /initramfs /
COPY config.json /
CMD ["/server", "--config-file", "/config.json"]
```

The entire runtime is packaged onto the initramfs, so the VM doesn't attach any disks; this saves needing to deal with any disk manipulation, since userspace libraries for writing disk filesystems is practically nonexistent (and needing privileged access to mount a loop device is a non-starter since this needs to happen in the build process). The guest VM thus only needs its initramfs and kernel, keeping the files needed to boot the VM to a minimum. We load the "container" into a chroot within the guest so that we can keep (and access) kernel modules at the root of the initramfs, without needing to intrude on the environment that the challenge "container" sees.

To communicate between the guest and the actual TCP server, we have a agent in the guest running as `/init`. We use a virtio vsock (over the MMIO transport exposed by Firecracker, though the same image works with the PCI transport that QEMU exposes) for the traffic, on two ports: one for control (loading configuration options on the guest), and the other that is directly connected to the guest container's stdio streams (to have as few layers of buffering as possible). In addition, by splitting configuration to be loaded from the host side on guest startup, this allows us to adjust configuration knobs quickly from the host container by simply setting environment variables (which get parsed and then passed to the guest) without requiring rebuilding the image.

[firecracker]: https://firecracker-microvm.github.io
[redpwnjail]: https://github.com/redpwn/jail

This section was written by asphyxia and if you have any questions, feel free to reach out!

#### Cache On The Side

Cache on the side was an awesome challenge around cache side channels. Due to the strict constraints for challenges which rely on side channels there was a lot of unique setup required the challenge. First, this challenge ran on its own N2 instance outside of our challenge cluster. Wiresboy added code for the server to pull from a GCP pub/sub queue instead of directly giving competitors access to the challenge. To actually send files to the challenge competitors could send requests via a frontend that queued messages which the backend would then process.

As you can probably tell, this involves setting up infrastructure outside of our standard challenge cluster so it caused some pain points. One main issue was there was so much to handle outside of this challenge that none of our infra team had the bandwidth to attend to it at the beginning. After the initial wave of challenge releases we began investigating why it wasn't working and starting fixes.

First, we had to setup a new service account for the backend and frontend instances to access the pub/sub queue. We also had to create a bucket to store the results as well as the N2 challenge instance. One small detail we missed when creating the box was to use Ubuntu instead of Debian which wasted a few hours. After that, setting up the N2 challenge instance to receive traffic worked well as it was listening to the pub/sub queue. On the frontend side we had to modify our challenge deployment infrastructure to support workload identities. This is GKE's way of allowing kubernetes pods to authorize as service accounts. Finally with this all together we were able to confirm the challenge worked.

Despite sounding easy in hindsight, it took a lot of effort to fix small mistakes as well as balancing this with all the other things going on to make sure the CTF stayed afloat.

#### Costs

One part I found interesting was just how much it costs to run a CTF. This cost is actually more than we normally expect for a CTF due to the pretty expensive N2 instances required for the cache-on-the-side challenge.

For the CTF weekend from 2/4 to 2/6 our total costs were around $72. This is with a production-scaled cluster including 3 e2-standard-2 and 2 n2-standard-2 nodes for our challenge cluster as well as an additional N2 instance for the cache challenge. An estimated cost if we were not running with the N2 servers would be $50.

After the CTF weekend, we typically scale down our cluster. This includes moving our rCTF instance to an e2-micro and scaling the cluster to 2 spot instances. With these changes our entire infrastructure costs around $8 per day. The nice part about running on kubernetes is that even if a spot instance gets preempted, once the node is back the control plane will automatically restore challenge health!

This breakdown was surprising to me at first because it is a lot cheaper than I expected. However, our infrastructure team puts a lot of effort into optimizing and making sure that our costs are kept to a minimum while keeping competitors happy. I hope this gives a little for others running CTFs as well as competitors what costs are expected when running a CTF.

### Conclusion

Running a CTF is no easy task and filled with many unexpected challenges. Even though we have previous experience running CTFs with high traffic, DiceCTF 2022 still brought many unexpected difficulties. I have definitely learned a lot on both a technical side as well as how to deal with the logistics of a large scale event. Furthermore, I'm really grateful to be able to have people like ginkoid and asphyxia around who are able to help me improve my technical skills around infrastructure. A lot of the things I worked on involved asking them a ton of questions.

Overall, the goal of this post is to give everyone including competitors, organizers, and spectators, a look at what running DiceCTF and a CTF in general looks like. It is a lot of work, but the reward of seeing others have a good time and solve these challenges is unparalleled. Another cool benefit is getting to see competitors creative approaches to challenges which even resulted in a [Traefik 0-day](https://github.com/traefik/traefik/security/advisories/GHSA-hrhx-6h34-j5hc) being discovered during DiceCTF! If you have any questions feel free to reach out and I would be happy to answer!
