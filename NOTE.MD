//create project
npx create-next-app@latest . --typescript


√ Would you like to use ESLint? ...   Yes
√ Would you like to use Tailwind CSS? ... No 
√ Would you like to use `src/` directory? ... No 
√ Would you like to use App Router? (recommended) ...  Yes
√ Would you like to use Turbopack for next dev?  ...  Yes
√ Would you like to customize the default import alias? ... No      

global.d.ts //root directory
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

npm i bootstrap bootstrap-icons
npm i @types/bootstrap --save-dev
npm i react-bootstrap@latest 

//add file global.d.ts
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

npm i @prisma/client 
npm i prisma --save-dev
npx prisma init --datasource-provider mongodb
npx prisma db push
npx prisma generate

npm i next-auth@beta

npm i @lexical/file @lexical/link @lexical/rich-text

npm i @lexical/list @lexical/plain-text 

npm i @lexical/table @lexical/utils

npm i @lexical/react --force or --legacy-peer-deps

npm  i lodash-es formidable
npm i @types/formidable --save-dev
npm i  @types/react-bootstrap --save-dev



