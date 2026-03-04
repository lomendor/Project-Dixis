import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Επικοινωνία",
  description: "Επικοινωνήστε μαζί μας για ερωτήσεις, σχόλια ή υποστήριξη. Η ομάδα του Dixis είναι εδώ για εσάς.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
