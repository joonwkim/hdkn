//create project
npx create-next-app@latest . --typescript


√ Would you like to use TypeScript? ... No / Yes
√ Would you like to use ESLint? ... No / Yes
√ Would you like to use Tailwind CSS? ... No / Yes
√ Would you like to use `src/` directory? ... No / Yes
√ Would you like to use App Router? (recommended) ... No / Yes
√ Would you like to customize the default import alias? ... No / Yes        
√ What import alias would you like configured? ... @/*
<!-- Creating a new Next.js app in D:\AmiAiLabTs\shopping-cart. -->

//tsconfig.json 에서 
"module": "NodeNext",
<!-- "moduleResolution": "NodeNext", 변경 -->


// bootstrap and basic libs
pnpm add bootstrap react-bootstrap @hookform/resolvers @next-auth/prisma-adapter @prisma/client bcrypt jsonwebtoken next-auth react-hook-form react-icons zod react-toastify

pnpm add -D @types/react-bootstrap @types/bcrypt @types/jsonwebtoken @types/react-bootstrap html-react-parser

//components folder 복사
//lib 복사

//root layout.tsx  복사

//.env 및 .env.sample복사
//.gitignore 복사



//next-auth 위에 포함되었음
pnpm add next-auth jsonwebtoken
pnpm add -D @types/jsonwebtoken

//next-auth.d.ts
import { Role } from "@prisma/client"
import "next-auth/jwt"



//google callback url login your google account
https://console.cloud.google.com/projectselector2/apis/credentials?supportedpurview=pro
register your callback url on credentials


//prisma
pnpm add -D prisma
pnpm add @prisma/client
pnpx prisma init //to initialize prism

.env //create .env file on root directory
enter DATABASE_URL value 
add .env to .gitignore

update datasource in /prisma/schema.prisma 
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

clreate model in /prisma/schema
model Todo {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

npx prisma db push
npx prisma generate

//create prisma client
//prisma.ts 

import { PrismaClient } from "@prisma/client";

declare global{
   var prisma: PrismaClient | undefined
}
let prisma: PrismaClient
let prismaPromise: Promise<PrismaClient>

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma

create services folder for data service


//next-auth
pnpm add next-auth jsonwebtoken
pnpm add -D @types/jsonwebtoken

//next-auth.d.ts
import { Role } from "@prisma/client"
import "next-auth/jwt"

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    id:UserId
    roles: Role[]
  }
}

declare module "next-auth" {
  interface Session{
    user:User & {
      id:UserId
      roles: Role[]
    }
  }
}


// user server를 사용하기 위해서는 
next.config.ts File을 생성

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

// ckeditor
pnpm add  @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic


//create app


//vercel
//vercel command cli
npm install -g vercel
vercel deploy
vercel --prod

// deploy error
+ vercel
+ ~~~~~~
    + CategoryInfo          : 보안 오류: (:) [], PSSecurityException

//PowerShell에 관리자 권한으로 열어 하기 명령 수행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine




//in case of prisma modify package.json like this
 "db:push": "prisma db push",
 "build": "prisma generate & next build",


error can't resolve fs // fs 는 node server로 'use server'를 사용해야함
 pnpm add fs


 //file upload 

 pnpm add react-dropzone


//lodash
npm install --save @types/lodash


//cloudinary
pnpm add cloudinary

//ckeditor
pnpm add @ckeditor/ckeditor5-build-classic @ckeditor/ckeditor5-editor-classic @ckeditor/ckeditor5-react
pnpm  add @ckeditor/ckeditor5-basic-styles @ckeditor/ckeditor5-essentials @ckeditor/ckeditor5-paragraph

pnpm add html-react-parser

//custom build configuration 
// ckeditor.com에 가서 inline 또는 download로 ckeditorfile을 만들어 download하고 project directory 에 압축 해제후 옮겨놓고
// yarn add file: ./압축해제한 folder이름  ex) ./ckeditor5
//package.json에서 add 여부를 확인    "ckeditor5-custom-build": "./ckeditor5",
//note pnpm 은 add가 되지 않음
//build 시 error가 발생할 시 
//ReferenceError: self is not defined
//ckeditor를 import할 때 dynamic을 이용할 것


//git

// log 보기
git log --oneline --all --graph

// brach 만들기
git checkout -b develop

//
git push

//set to upstream
git push --set-upstream origin develop

// youtube address https://www.youtube.com/watch?v=3o_01F04bZ4
//git rebase와 git squash를 하기위하여 gitlens extension을 설치 
// run  command  to config rebase 
git config --global core.editor "code --wait"
// rebase command main is target
git rebase -i main

//github pull requests and issues extension
// https://www.youtube.com/watch?v=LdSwWxVzUpo
// extension GitHub Pull Requests and Issues


// how to clean up all the history and branches in github

git checkout --orphan last

//-A : --all --no-ignore-removal
git add -A

git commit -am "refsh init"

// delete master branch
git branch -D master

// rename
git branch -m main

git push -f origin main

//garbage collection
git gc --aggressive --prune=all


//send mail using node mailer
npm install nodemailer

