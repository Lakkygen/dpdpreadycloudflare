import Hero from '../components/Hero';
import ScanForm from '../components/ScanForm';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Hero />
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Scan Your Website</h2>
            <p className="mt-4 text-lg text-slate-400">
              Get an instant DPDP compliance score and actionable recommendations.
            </p>
          </div>
          <ScanForm />
        </div>
      </section>
      <Footer />
    </div>
  );
}
