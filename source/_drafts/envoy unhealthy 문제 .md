---
title: ecs sidecar envoy unhealthy 문제
tags: ["appmesh", "envoy", "unhealthy"]
categories: ["troubleshooting"]
date: {{ date }}
---

# envoy unhealthy 문제

## 문제점

ecs에서 envoy 사이드카 컨테이너를 실행하면, 타겟 그룹의 헬스 체크에서 unhealthy 상태가 된다.  

## 해결

task가 appmesh에 대한 권한이 없어서 그런 문제다. iam에서 정책을 추가해 주자. 로그를 볼 수 없는데다가 관련 오류에 대한 스레드를 찾을 수 없어서 오래 걸렸다. envoy가 unhealthy 상태에 빠지길 기다렸다가 보면 컨테이너 로그를 볼 수 있다.  


```yaml
# Example Updated ECS Task Role definition in CloudFormation
TaskIamRole:
    Type: AWS::IAM::Role
    Properties:
      Path: /
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Principal:
              Service:
                - "ecs-tasks.amazonaws.com"
            Action:
              - "sts:AssumeRole"
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/CloudWatchFullAccess
        - arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess
      Policies:
        - PolicyName: "AppMeshStreamAggregatedResources"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: "Allow"
                Action:
                  - "appmesh:StreamAggregatedResources"
                Resource:
                - Fn::Sub: "arn:${AWS::Partition}:appmesh:${AWS::Region}:${AWS::AccountId}:mesh/my-mesh/virtualNode/my-node"
```