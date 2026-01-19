
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, MapPin, Trash2, Edit, Check, Star } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Address {
    id: string;
    address: string;
    city: string;
    reference: string | null;
    dni: string | null;
    phone: string | null;
    is_default: boolean;
}

export function AddressesSection() {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const [formData, setFormData] = useState({
        address: "",
        city: "",
        reference: "",
        dni: "",
        phone: "",
        is_default: false,
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setEditingAddress(null);
            setFormData({
                address: "",
                city: "",
                reference: "",
                dni: "",
                phone: "",
                is_default: false,
            });
        }
    }, [isOpen]);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_addresses")
                .select("*")
                .order("is_default", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error) {
            console.error("Error loading addresses:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las direcciones.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            address: address.address,
            city: address.city,
            reference: address.reference || "",
            dni: address.dni || "",
            phone: address.phone || "",
            is_default: address.is_default,
        });
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

        try {
            const { error } = await supabase
                .from("user_addresses")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setAddresses(addresses.filter(a => a.id !== id));
            toast({
                title: "Dirección eliminada",
                description: "La dirección ha sido eliminada correctamente.",
            });
        } catch (error) {
            console.error("Error deleting address:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la dirección.",
                variant: "destructive",
            });
        }
    };

    const handleSetDefault = async (address: Address) => {
        if (address.is_default) return;

        try {
            // Optimistic update
            setAddresses(addresses.map(a => ({
                ...a,
                is_default: a.id === address.id
            })));

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // The database trigger will handle setting other addresses to is_default = false
            const { error } = await supabase
                .from("user_addresses")
                .update({ is_default: true })
                .eq("id", address.id);

            if (error) throw error;

            toast({
                title: "Dirección principal actualizada",
                description: "Esta dirección ahora es la predeterminada.",
            });

            // Reload to ensure consistency
            loadAddresses();

        } catch (error) {
            console.error("Error setting default address:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la dirección principal.",
                variant: "destructive",
            });
            loadAddresses(); // Revert on error
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.address || !formData.city || !formData.dni || !formData.phone) {
            toast({
                title: "Campos incompletos",
                description: "Por favor completa todos los campos requeridos.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            const payload = {
                user_id: user.id,
                address: formData.address,
                city: formData.city,
                reference: formData.reference || null,
                dni: formData.dni,
                phone: formData.phone,
                is_default: formData.is_default,
            };

            let error;

            if (editingAddress) {
                const { error: updateError } = await supabase
                    .from("user_addresses")
                    .update(payload)
                    .eq("id", editingAddress.id);
                error = updateError;
            } else {
                // If it's the first address, make it default automatically
                if (addresses.length === 0) {
                    payload.is_default = true;
                }

                const { error: insertError } = await supabase
                    .from("user_addresses")
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: editingAddress ? "Dirección actualizada" : "Dirección agregada",
                description: "Tus cambios han sido guardados exitosamente.",
            });

            setIsOpen(false);
            loadAddresses();
        } catch (error) {
            console.error("Error saving address:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la dirección.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mis Direcciones</h2>
                    <p className="text-gray-500 text-sm">Gestiona tus direcciones de envío y facturación.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Dirección
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? "Editar Dirección" : "Agregar Nueva Dirección"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni">DNI / RUC *</Label>
                                    <Input
                                        id="dni"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        placeholder="12345678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="999 888 777"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección Completa *</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Av. Principal 123, Dpto 401"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad / Distrito *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Lima, Miraflores"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference">Referencia (Opcional)</Label>
                                <Input
                                    id="reference"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="Frente al parque..."
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <Label htmlFor="is_default" className="cursor-pointer">Usar como dirección predeterminada</Label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="mr-2">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingAddress ? "Guardar Cambios" : "Guardar Dirección"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No tienes direcciones guardadas</h3>
                    <p className="text-gray-500 mt-1 mb-6">Agrega una dirección para agilizar tus compras.</p>
                    <Button onClick={() => setIsOpen(true)} variant="outline">
                        Agregar primera dirección
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`relative bg-white p-6 rounded-xl border transition-all hover:shadow-md ${addr.is_default ? "border-amber-200 shadow-sm ring-1 ring-amber-100" : "border-gray-100"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className={`w-5 h-5 ${addr.is_default ? "text-amber-500" : "text-gray-400"}`} />
                                    <span className="font-bold text-gray-900">{addr.city}</span>
                                </div>
                                {addr.is_default && (
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                        Predeterminada
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-1 mb-4 text-sm text-gray-600">
                                <p className="line-clamp-2">{addr.address}</p>
                                {addr.reference && <p className="text-gray-400 italic font-light">Ref: {addr.reference}</p>}
                                <div className="flex gap-4 pt-1 text-gray-500 text-xs">
                                    <span>DNI: {addr.dni}</span>
                                    <span>Tel: {addr.phone}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                {!addr.is_default ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-amber-600 p-0 h-auto font-normal text-xs hover:bg-transparent"
                                        onClick={() => handleSetDefault(addr)}
                                    >
                                        <Star className="w-3 h-3 mr-1" />
                                        Hacer principal
                                    </Button>
                                ) : (
                                    <span className="text-xs text-amber-600 font-medium flex items-center">
                                        <Check className="w-3 h-3 mr-1" /> Principal
                                    </span>
                                )}

                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleEdit(addr)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(addr.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
