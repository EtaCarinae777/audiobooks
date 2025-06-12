import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";

// Załadowanie czcionki Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sluchaj.to - Twoja biblioteka audiobooków",
  description: " Twoja ulubiona platforma do słuchania audiobooków online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-gray-100`}>
        <Header />
        <main className="container mx-auto py-8">{children}</main>
        <footer className="border-t border-gray-200 py-6">
          <div className="container mx-auto text-center text-gray-500">
            &copy; 2025 Sluchaj.to. Wszelkie prawa zastrzeżone.
          </div>
        </footer>
      </body>
    </html>
  );
}
