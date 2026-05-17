---
name: init-post
description: 포스트 스켈레톤을 생성한다.
argument-hint: <file-name-without-extension, category, layout>
disable-model-invocation: true
---

# 설명

- 새로운 포스트 스켈레톤 파일을 $ARGUMENTS의 첫번째 인자를 파일명으로 하여, vitepress post 형식으로 생성한다.
- docs/draft/<category>/<올해 연도>/<file-name-without-extension>.md 로 파일 생성
- <layout>을 반영하여 frontmatters만 scaffolding 한다. 기본은 post다.
