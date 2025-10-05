import {PrismaClient} from '@prisma/client';
const db = new PrismaClient();
async function main(){
  const items = [
    {slug:'aiges', name:'Αγρόκτημα Αιγές', region:'Πελοπόννησος', category:'Φρούτα', products:12, rating:4.7, phone:'+30 2100000000'},
    {slug:'meli-olympou', name:'Μέλι Ολύμπου', region:'Θεσσαλία', category:'Μέλι', products:8, rating:4.8},
    {slug:'tyrokomeio-kritis', name:'Τυροκομείο Κρήτης', region:'Κρήτη', category:'Γαλακτοκομικά', products:15, rating:4.6}
  ];
  for(const p of items){ await db.producer.upsert({where:{slug:p.slug}, update:p, create:p}); }
}
main().finally(()=>process.exit(0));
