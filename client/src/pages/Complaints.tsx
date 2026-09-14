import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, CheckCircle, Search, Loader2, ArrowRight, Info } from "lucide-react";
import { api } from "../lib/api";

// Shadcn UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";

const computePoW = async (seed: string, difficulty: number): Promise<string> => {
  let nonce = 0;
  const targetPrefix = '0'.repeat(difficulty);
  const encoder = new TextEncoder();
  while (true) {
    const input = seed + nonce.toString();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex.startsWith(targetPrefix)) {
      return nonce.toString();
    }
    if (nonce % 500 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
    nonce++;
  }
};

export function Complaints() {
  // Submit State
  const [category, setCategory] = useState("GRADING");
  const [content, setContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [trackingCode, setTrackingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Lookup State
  const [lookupCode, setLookupCode] = useState("");
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10) {
      setErrorMsg("Please provide more detail (at least 10 characters).");
      return;
    }

    setSubmitStatus('submitting');
    setErrorMsg("");

    try {
      const { data: challengeData } = await api.get('/complaints/challenge');
      const nonce = await computePoW(challengeData.seed, challengeData.difficulty);
      
      const { data: submitData } = await api.post('/complaints/submit', {
        seed: challengeData.seed,
        nonce,
        category,
        content
      });
      
      setTrackingCode(submitData.trackingCode);
      setSubmitStatus('success');
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMsg(err?.response?.data?.error || "Failed to submit complaint. Please try again.");
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode) return;

    setLookupStatus('loading');

    try {
      const { data } = await api.get(`/complaints/status/${lookupCode}`);
      setLookupResult(data);
      setLookupStatus('found');
    } catch (err: any) {
      setLookupStatus('not_found');
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Speak Up</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
          Report issues, appeal grades, or flag platform bugs completely anonymously.
        </p>
      </div>

      <noscript>
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>JavaScript is required</AlertTitle>
          <AlertDescription>
            We use a browser-based proof-of-work challenge instead of tracking CAPTCHAs to guarantee anonymity. 
            If you cannot enable JavaScript, please email us directly at <a href="mailto:speakup@offclass.local" className="underline font-semibold hover:text-destructive-foreground/80">speakup@offclass.local</a>.
          </AlertDescription>
        </Alert>
      </noscript>

      <Card className="shadow-lg border-muted/60 overflow-hidden">
        <Tabs defaultValue="submit" className="w-full">
          <div className="border-b bg-muted/30 px-6 py-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="submit" className="font-bold">Submit Complaint</TabsTrigger>
              <TabsTrigger value="lookup" className="font-bold">Check Status</TabsTrigger>
            </TabsList>
          </div>

          {/* SUBMIT TAB */}
          <TabsContent value="submit" className="p-6 md:p-10 m-0">
            {submitStatus === 'success' ? (
              <div className="text-center py-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Submission Received</h2>
                  <p className="text-muted-foreground mt-2">Your complaint has been securely filed.</p>
                </div>
                
                <Alert variant="destructive" className="max-w-md mx-auto border-red-200 bg-red-50 text-red-900">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Save this tracking code now</AlertTitle>
                  <AlertDescription className="mt-4 flex flex-col items-center">
                    <div className="font-mono text-4xl tracking-[0.2em] font-black py-4 px-6 bg-white rounded-xl border shadow-inner w-full text-center">
                      {trackingCode}
                    </div>
                    <span className="text-sm mt-4 font-medium opacity-90 text-center">
                      You cannot recover this code once you close this page. You need it to check for replies or resolution status.
                    </span>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline"
                  onClick={() => { setSubmitStatus('idle'); setContent(''); }}
                  className="font-bold mt-4"
                  size="lg"
                >
                  File Another Report
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in duration-300">
                <Alert className="bg-blue-50 text-blue-900 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="font-bold text-blue-900">Privacy Guarantee</AlertTitle>
                  <AlertDescription className="text-blue-800">
                    This form does not track your session, IP address, or identity. We use an in-browser anti-spam check instead of CAPTCHA.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="category" className="text-base font-bold">What is this regarding?</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="h-14 text-base">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRADING">Grading dispute / Unfair marking</SelectItem>
                      <SelectItem value="HARASSMENT">Harassment / Bullying / Code of Conduct violation</SelectItem>
                      <SelectItem value="PLATFORM_BUG">OffClass platform bug or missing points</SelectItem>
                      <SelectItem value="OTHER">Other concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="content" className="text-base font-bold">Details</Label>
                    <p className="text-sm text-muted-foreground font-medium">
                      Provide enough context for us to investigate. Do not include your name if you wish to remain anonymous.
                    </p>
                  </div>
                  <Textarea 
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="Explain the situation in detail..."
                    className="resize-y min-h-[150px] p-4 text-base bg-white"
                  />
                </div>

                {errorMsg && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                  size="lg"
                  className="w-full h-14 text-lg font-bold"
                >
                  {submitStatus === 'submitting' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Computing Proof of Work & Submitting...
                    </>
                  ) : (
                    "Submit Anonymously"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          {/* LOOKUP TAB */}
          <TabsContent value="lookup" className="p-6 md:p-10 m-0 animate-in fade-in duration-300">
            <div className="flex flex-col gap-8">
              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="text" 
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  className="h-14 font-mono font-bold tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal text-base bg-white"
                />
                <Button 
                  type="submit"
                  disabled={lookupStatus === 'loading' || !lookupCode}
                  size="lg"
                  className="h-14 px-8 font-bold"
                >
                  {lookupStatus === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" /> 
                      Check
                    </>
                  )}
                </Button>
              </form>

              {lookupStatus === 'not_found' && (
                <div className="text-center p-8 bg-muted/50 border rounded-xl text-muted-foreground font-medium">
                  No complaint found with that tracking code. Ensure you typed it correctly.
                </div>
              )}

              {lookupStatus === 'found' && lookupResult && (
                <Card className="shadow-sm border-muted">
                  <CardHeader className="border-b bg-muted/10 pb-6 flex flex-row items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filed On</span>
                      <span className="font-mono text-foreground font-bold">{lookupResult.reportedDay}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                      <span className="text-primary font-black">{lookupResult.status.replace('_', ' ')}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3">
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        Response from Faculty
                      </div>
                      <div className="p-5 bg-muted/30 rounded-xl border text-foreground leading-relaxed min-h-[100px]">
                        {lookupResult.adminNotes ? (
                          lookupResult.adminNotes
                        ) : (
                          <span className="text-muted-foreground italic font-medium">No notes added yet.</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
