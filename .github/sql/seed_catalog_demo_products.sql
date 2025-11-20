CREATE TABLE IF NOT EXISTS catalog_demo_products (
  id text primary key,
  title text not null,
  price_cents int not null,
  producer text,
  image text
);
INSERT INTO catalog_demo_products (id,title,price_cents,producer,image) VALUES
('p1','Θυμαρίσιο Μέλι Λήμνου 450g',780,'Μέλισσες του Αιγαίου','/demo/honey.jpg') ON CONFLICT (id) DO NOTHING,
('p2','Μαρμελάδα Σύκο 250g',520,'Λημνια Γη','/demo/jam.jpg') ON CONFLICT (id) DO NOTHING,
('p3','Ελαιόλαδο Εξαιρετικό Παρθένο 750ml',1290,'Ελαιοτρόπιο','/demo/olive.jpg') ON CONFLICT (id) DO NOTHING,
('p4','Γραβιέρα 300g',690,'Τυροκομείο Ορος','/demo/cheese.jpg') ON CONFLICT (id) DO NOTHING,
('p5','Ρίγανη 50g',290,'Αρωματικά Αιγαίου','/demo/oregano.jpg') ON CONFLICT (id) DO NOTHING,
('p6','Κρασί Μοσχάτο 750ml',980,'Κτήμα Βοριάς','/demo/wine.jpg') ON CONFLICT (id) DO NOTHING;
