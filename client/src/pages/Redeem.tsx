import { useState } from "react";
import { Gift, CheckCircle, XCircle, Store, Coins, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import type { House } from "../../../shared/src/schemas/user";

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  quantityRemaining: number | null;
  isActive: boolean;
}

const HOUSE_GRADIENTS: Record<House, string> = {
  RED: "from-red-900 to-red-950 text-red-50",
  BLUE: "from-blue-900 to-blue-950 text-blue-50",
  GREEN: "from-emerald-900 to-emerald-950 text-emerald-50",
  PURPLE: "from-purple-900 to-purple-950 text-purple-50",
};

const HOUSE_ACCENTS: Record<House, string> = {
  RED: "text-red-500",
  BLUE: "text-blue-500",
  GREEN: "text-emerald-500",
  PURPLE: "text-purple-500",
};

export function Redeem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [status, setStatus] = useState<'idle' | 'confirm' | 'processing' | 'success' | 'error'>('idle');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  const { data: catalogueData, isLoading } = useQuery({
    queryKey: ['perks'],
    queryFn: async () => {
      const res = await api.get('/perks');
      return res.data;
    }
  });

  const CATALOGUE: Perk[] = catalogueData?.items || [];
  const userPoints = user?.points || 0;
  const userHouse = user?.house as House;

  const redeemMutation = useMutation({
    mutationFn: async ({ id, idempotencyKey }: { id: string, idempotencyKey: string }) => {
      await api.post(`/perks/${id}/redeem`, { idempotencyKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perks'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    }
  });

  const handleSelect = (perk: Perk) => {
    const isAvailable = perk.quantityRemaining === null || perk.quantityRemaining > 0;
    if (!isAvailable || userPoints < perk.cost) return;
    setSelectedPerk(perk);
    setStatus('confirm');
    setIdempotencyKey(crypto.randomUUID());
  };

  const handleConfirm = () => {
    if (!selectedPerk) return;
    setStatus('processing');
    redeemMutation.mutate({ id: selectedPerk.id, idempotencyKey });
  };

  const handleReset = () => {
    setStatus('idle');
    setSelectedPerk(null);
  };

  const isOpen = status !== 'idle';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      
      {/* Hero Banner */}
      <div className={cn(
        "w-full rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-end justify-between gap-6 min-h-[200px]",
        "bg-gradient-to-br",
        userHouse ? HOUSE_GRADIENTS[userHouse] : "from-gray-800 to-gray-900 text-white"
      )}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Store size={300} />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Redemption Store</h1>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl">
            Exchange your hard-earned points for exclusive perks, priority placements, and digital badges.
          </p>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-end min-w-[200px]">
          <span className="text-white/80 text-sm uppercase tracking-wider font-bold mb-1">Available Balance</span>
          <div className="flex items-center gap-2">
            <Coins size={32} className="text-yellow-400" />
            <span className="font-mono text-4xl font-black">{userPoints}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <div className="flex items-center gap-2 animate-pulse">
            <Store size={24} />
            <span className="font-semibold text-lg">Loading catalogue...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CATALOGUE.map(perk => {
            const isAvailable = perk.quantityRemaining === null || perk.quantityRemaining > 0;
            const canAfford = userPoints >= perk.cost;
            const disabled = !isAvailable || !canAfford;

            return (
              <Card 
                key={perk.id} 
                className={cn(
                  "flex flex-col relative transition-all duration-300",
                  !disabled && "hover:-translate-y-1 hover:shadow-lg hover:border-primary/50",
                  disabled && "opacity-75 grayscale-[0.2]"
                )}
              >
                {!isAvailable && (
                  <Badge variant="destructive" className="absolute top-4 right-4 z-10">
                    Out of Stock
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl leading-tight pr-12">{perk.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "font-mono font-bold text-lg",
                      canAfford ? (userHouse ? HOUSE_ACCENTS[userHouse] : "text-primary") : "text-destructive"
                    )}>
                      {perk.cost} pts
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed">{perk.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-3">
                  {perk.quantityRemaining !== null && isAvailable && (
                    <div className="text-xs font-medium text-muted-foreground self-start">
                      {perk.quantityRemaining} remaining
                    </div>
                  )}
                  <Button
                    onClick={() => handleSelect(perk)}
                    disabled={disabled}
                    className="w-full font-bold"
                    variant={canAfford && isAvailable ? "default" : "secondary"}
                    size="lg"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    {isAvailable ? (canAfford ? "Redeem Perk" : "Insufficient Points") : "Sold Out"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Redemption Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
        <DialogContent className="sm:max-w-md">
          {status === 'confirm' && selectedPerk && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Confirm Redemption</DialogTitle>
                <DialogDescription className="text-base pt-2">
                  You are about to spend <strong className="font-mono text-destructive">{selectedPerk.cost}</strong> points on <strong className="text-foreground">{selectedPerk.name}</strong>.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3 mt-6">
                <Button variant="outline" onClick={handleReset} className="flex-1 font-bold">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="flex-1 font-bold">
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}

          {status === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-xl">Processing transaction...</DialogTitle>
                <div className="font-mono text-xs text-muted-foreground">ID: {idempotencyKey}</div>
              </div>
            </div>
          )}

          {status === 'success' && selectedPerk && (
            <div className="flex flex-col items-center text-center py-6 gap-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-2xl font-black">Redemption Successful</DialogTitle>
                <DialogDescription className="text-base pt-2">
                  Your request for <strong className="text-foreground">{selectedPerk.name}</strong> has been logged in the ledger and sent for fulfillment.
                </DialogDescription>
              </div>
              <Button onClick={handleReset} className="w-full font-bold mt-4" size="lg">
                Close
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-center py-6 gap-6">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-2xl font-black">Transaction Failed</DialogTitle>
                <DialogDescription className="text-base pt-2">
                  There was an issue processing your request. Your points have not been deducted.
                </DialogDescription>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <Button variant="outline" onClick={handleReset} className="flex-1 font-bold">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirm} className="flex-1 font-bold">
                  Retry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
