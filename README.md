# He11divers TIL

He11divers 스터디원들이 각자 학습한 내용을 Markdown으로 기록하는 TIL 저장소입니다.

각 스터디원은 `raw/{github-id}/` 아래에서 폴더와 `.md` 파일을 자유롭게 관리합니다. `main`에 push된 Markdown은 TIL 사이트에서 자동으로 읽어 표시하므로, 별도의 CMS나 관리자 페이지에서 글을 작성하지 않습니다.

> 스터디 참여자는 이 파일을 반드시 정독해주세요!

## 1. Repository 받기

이 저장소는 Collaborator가 별도의 feature branch나 PR 없이 자신의 TIL을 `main`에 직접 commit하고 push하는 방식으로 운영합니다.

```bash
git clone https://github.com/He11divers/TIL.git
cd TIL

git switch main
git pull origin main
```

## 2. TIL 작성

TIL은 다음 디렉토리에 작성합니다.

```text
raw/{내-github-id}/
```

> 반드시 자신의 `raw/{내-github-id}/` 아래에서만 글을 작성하고, 다른 스터디원의 디렉토리는 임의로 수정하지 않습니다. 아직 `study.config.ts`에 등록되지 않은 새 스터디원은 운영자에게 등록을 요청해 주세요.

자신의 디렉토리 아래에서는 주제에 맞게 폴더와 파일을 자유롭게 구성할 수 있습니다.

```text
Ex.
raw/
└── r3j0}/
    ├── algorithm/
    │   ├── bfs.md
    │   └── graph/
    │       └── dijkstra.md
    ├── nextjs/
    │   └── server-component.md
    └── daily.md
```

이 폴더 구조는 TIL 페이지의 File Explorer에도 그대로 표시됩니다. 파일과 폴더 이름에는 한글과 공백도 사용할 수 있지만, TIL 게시글로 인식되려면 파일 확장자가 반드시 `.md`여야 합니다.

## 3. Frontmatter 작성하기

모든 TIL Markdown 파일의 맨 위에는 frontmatter가 필요합니다. 아래 템플릿을 복사해서 사용할 수 있습니다.

```md
---
title: 이벤트 루프 정리
description: 태스크 큐와 마이크로태스크 큐의 실행 순서
date: "2026-09-01"
---

## 배운 내용

오늘 학습한 내용을 작성합니다.
```

| 항목 | 필수 | 규칙 |
| --- | :---: | --- |
| `title` | O | 비어 있지 않은 문자열 |
| `description` | X | 작성한다면 비어 있지 않은 문자열 |
| `date` | O | `"YYYY-MM-DD"` 형식의 실제 날짜 |

## 4.  Markdown 작성 가이드

TIL Viewer는 heading, 강조, 목록, task list, 인용문, 링크, 코드와 syntax highlighting, 표, 이미지 등 GitHub Flavored Markdown을 지원합니다.

문법과 예시는 [He11divers TIL 마크다운 사용 가이드](./raw/r3j0/sample.md)를 참고하세요.

이미지는 Markdown 파일과 같은 `raw/{github}` 트리 안에 둡니다.

```text
raw/r3j0/
└── nextjs/
    ├── server-component.md
    └── images/
        └── architecture.png
```

Markdown 파일을 기준으로 상대경로를 작성합니다.

```md
![Server Component 구조](./images/architecture.png)
```

상위 폴더에 있는 이미지도 일반적인 상대경로로 연결할 수 있습니다.

```md
![공통 이미지](../images/shared.png)
```

지원하는 로컬 이미지 확장자는 다음과 같습니다.

```text
.png .jpg .jpeg .gif .webp .svg
```

## 5. 로컬에서 확인하기

TIL 작성만 할 때는 로컬 Next.js 서버를 반드시 실행할 필요가 없습니다. 실제 사이트에서 어떻게 표시되는지 미리 확인하고 싶다면 최초 한 번 의존성을 설치합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다. 자신의 TIL 페이지 주소는 `/til/{내-github-id}`입니다.

```text
http://localhost:3000/til/r3j0
```

## 6. Commit & Push

작성한 TIL과 stage할 파일을 먼저 확인한 뒤 자신의 디렉토리만 commit합니다.

commit message 의 형식은 `docs(자신의 이름): add (파일명)` 을 준수해야 합니다.

```bash
git status
git add raw/{내-github-id}/
git commit -m "docs(이름): add ~~~.md"
git push origin main
```

예를 들어 GitHub username이 `r3j0`이라면:

```bash
git status
git add raw/r3j0/
git commit -m "docs(박정근): add bfs_20260901.md"
git push origin main
```

