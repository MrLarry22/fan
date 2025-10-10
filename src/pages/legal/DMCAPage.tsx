import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedSection>
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white font-poppins mb-8">DMCA Policy</h1>
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Digital Millennium Copyright Act</h2>
                <p className="text-slate-300 leading-relaxed">
                  Fanview respects the intellectual property rights of others and expects our users to do 
                  the same. We respond to notices of alleged copyright infringement that comply with the 
                  Digital Millennium Copyright Act ("DMCA").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Filing a DMCA Notice</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you believe that content on Fanview infringes your copyright, please provide our 
                  designated agent with the following information:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>• A physical or electronic signature of the copyright owner or authorized agent</li>
                  <li>• Identification of the copyrighted work claimed to have been infringed</li>
                  <li>• Identification of the material that is claimed to be infringing</li>
                  <li>• Your contact information (address, phone number, email)</li>
                  <li>• A statement of good faith belief that the use is not authorized</li>
                  <li>• A statement that the information is accurate and you are authorized to act</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Counter-Notification</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you believe your content was removed in error, you may file a counter-notification 
                  with our designated agent. The counter-notification must include specific information 
                  as required by the DMCA.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Repeat Infringers</h2>
                <p className="text-slate-300 leading-relaxed">
                  Fanview will terminate the accounts of users who are determined to be repeat infringers 
                  in appropriate circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Designated Agent</h2>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-300 leading-relaxed">
                    <strong>DMCA Agent</strong><br />
                    Fanview Legal Department<br />
                    Email: dmca@fanview.com<br />
                    Address: [Legal Address]<br />
                    California, United States
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">False Claims</h2>
                <p className="text-slate-300 leading-relaxed">
                  Please note that under Section 512(f) of the DMCA, any person who knowingly materially 
                  misrepresents that material is infringing may be subject to liability for damages.
                </p>
              </section>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}