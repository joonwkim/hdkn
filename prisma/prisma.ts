// import { PrismaClient } from '@prisma/client'

// declare global{
//    let prisma: PrismaClient | undefined
// }
// const prisma = global.prisma || new PrismaClient()

// if(process.env.NODE_ENV === 'development') global.prisma = prisma

// export default prisma

// import { PrismaClient } from '@prisma/client';

// const prisma = globalThis.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// export default prisma;


// import { PrismaClient } from '@prisma/client';

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === 'production') {
//    prisma = new PrismaClient();
// } else {
//    if (!globalThis.prisma) {
//       global.prisma = new PrismaClient();
//    }
//    prisma = globalThis.prisma;
// }

// export default prisma;


import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
   prisma = new PrismaClient();
} else {
   const globalWithPrisma = global as typeof globalThis & {
      prisma: PrismaClient;
   };
   if (!globalWithPrisma.prisma) {
      globalWithPrisma.prisma = new PrismaClient();
   }
   prisma = globalWithPrisma.prisma;
}

export default prisma;