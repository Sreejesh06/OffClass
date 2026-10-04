import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

const ABI = [
    "function achievementHashes(bytes32) external view returns (bytes32)"
];

const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
const ANCHOR_CONTRACT_ADDRESS = import.meta.env.VITE_ANCHOR_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

interface VerificationData {
  achievement: {
    title: string;
    category: string;
    student: string;
    date: string;
  };
  expectedHash: string;
  txHash: string | null;
}

export function Verify() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || '');
  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'LOADING' | 'VERIFIED' | 'FAILED'>('IDLE');

  const { data, error, isLoading } = useQuery<VerificationData>({
    queryKey: ['verify', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/integrations/verify/${id}`);
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch verification data");
      }
      return res.json();
    },
    enabled: !!id,
  });

  const verifyOnChain = async (expectedHash: string, achievementId: string) => {
    try {
      setVerifyStatus('LOADING');
      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const contract = new ethers.Contract(ANCHOR_CONTRACT_ADDRESS, ABI, provider);

      const idBytes = '0x' + achievementId.replace(/-/g, '').padEnd(64, '0');
      const fetchedHash = await contract.achievementHashes(idBytes);
      
      setOnChainHash(fetchedHash);

      if (fetchedHash.toLowerCase() === ('0x' + expectedHash).toLowerCase()) {
          setVerifyStatus('VERIFIED');
      } else {
          setVerifyStatus('FAILED');
      }
    } catch (err) {
      console.error("Blockchain verification failed:", err);
      setVerifyStatus('FAILED');
    }
  };

  React.useEffect(() => {
    if (data?.expectedHash && id) {
      verifyOnChain(data.expectedHash, id);
    }
  }, [data, id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim()}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">Cryptographic Verification</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Verify the authenticity of a Cryptid achievement using the Polygon blockchain. 
          This proves the record was approved by faculty and has not been altered since.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Achievement ID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-mono text-sm focus:border-crypto-purple outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-crypto-purple text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Verify
          </button>
        </form>
      </div>

      {id && isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-crypto-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Querying Database & Blockchain...</p>
        </div>
      )}

      {id && error && (
        <div className="bg-red-50 text-red-900 p-6 rounded-2xl border-2 border-red-100">
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Lookup Failed
          </h3>
          <p>{error instanceof Error ? error.message : "Unknown error occurred."}</p>
        </div>
      )}

      {id && data && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
            <h2 className="text-2xl font-black mb-6">Achievement Record</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Student</p>
                <p className="font-bold text-lg">{data.achievement.student}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                <p className="font-bold text-lg">{data.achievement.category}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Title</p>
                <p className="font-bold text-lg">{data.achievement.title}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="font-bold text-lg">{new Date(data.achievement.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border-2 ${
            verifyStatus === 'LOADING' ? 'bg-gray-50 border-gray-200' :
            verifyStatus === 'VERIFIED' ? 'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h2 className="text-2xl font-black mb-6">Cryptographic Proof</h2>
            
            <div className="space-y-4 font-mono text-sm break-all">
              <div>
                <p className="font-bold text-gray-500 mb-1">Database Hash (Expected)</p>
                <p className="bg-white/50 p-3 rounded-lg border border-black/10">0x{data.expectedHash}</p>
              </div>
              
              <div>
                <p className="font-bold text-gray-500 mb-1">Blockchain Hash (Polygon Amoy)</p>
                {verifyStatus === 'LOADING' ? (
                  <p className="bg-white/50 p-3 rounded-lg border border-black/10 text-gray-400">Fetching from RPC...</p>
                ) : (
                  <p className="bg-white/50 p-3 rounded-lg border border-black/10">{onChainHash || '0x0000000000000000000000000000000000000000000000000000000000000000'}</p>
                )}
              </div>

              {data.txHash && (
                <div className="pt-4">
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${data.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-crypto-purple font-bold hover:underline"
                  >
                    View Transaction on PolygonScan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-black/10">
              {verifyStatus === 'LOADING' && (
                <p className="text-gray-600 font-bold text-lg flex items-center gap-3">
                  <span className="animate-pulse w-3 h-3 bg-gray-400 rounded-full"></span>
                  Verifying Cryptographic Anchor...
                </p>
              )}
              {verifyStatus === 'VERIFIED' && (
                <p className="text-green-700 font-black text-xl flex items-center gap-3">
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Cryptographically Verified
                </p>
              )}
              {verifyStatus === 'FAILED' && (
                <p className="text-red-700 font-black text-xl flex items-center gap-3">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                  Verification Failed: Data Mismatch
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
