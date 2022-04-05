---
title: ECS xray sidecar가 X-ray에 트레이싱 데이터를 전달하지 않는 문제
date: 2021-12-10 17:27:23
tags: ['x-ray', 'app mesh', 'ecs']
categories: ['troubleshooting']
---
# 문제
xray daemon sidecar가 정상적으로 실행되지만, xray 서버로 트레이싱 데이터를 전송하지 않는다.

# 해결책

# 찾아 본 자료

[X-Ray Service map not showing call from one micro service to another AWS EKS Fargate setup with App Mesh](https://github.com/aws/aws-app-mesh-roadmap/issues/272)

[Question: X-Ray sidecar with Fargate #141](https://github.com/aws/aws-app-mesh-examples/issues/141)

[AWS App Mesh Workshop > Distributed Tracing with X-Ray](https://www.appmeshworkshop.com/x-ray/xraycrystal/)