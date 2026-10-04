import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface ManagePerkModalProps {
  isOpen: boolean;
  onClose: () => void;
  perk?: any; // If perk is passed, we are editing. Otherwise creating.
}

export function ManagePerkModal({ isOpen, onClose, perk }: ManagePerkModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (perk && isOpen) {
      setName(perk.name);
      setDescription(perk.description);
      setCost(perk.cost.toString());
      setQuantity(perk.quantityRemaining !== null ? perk.quantityRemaining.toString() : "");
    } else if (isOpen) {
      setName("");
      setDescription("");
      setCost("");
      setQuantity("");
    }
  }, [perk, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (perk) {
        return api.put(`/api/perks/${perk.id}`, data);
      } else {
        return api.post(`/api/perks`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perks"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      description,
      cost: parseInt(cost, 10),
      quantityRemaining: quantity ? parseInt(quantity, 10) : null,
      isActive: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{perk ? "Edit Perk" : "Add New Perk"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (Points)</Label>
              <Input id="cost" type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Leave blank for infinite)</Label>
              <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Perk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
