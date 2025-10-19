"use client";

import { Link, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@inferno/ui/components/button";
import { Input } from "@inferno/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@inferno/ui/components/tabs";
import { Small } from "@inferno/ui/components/typography";

interface ImageSourceSelectorProps {
	onImageSelect: (imageSource: string) => void;
	defaultTab?: "upload" | "embed";
}

export function ImageSourceSelector({ onImageSelect, defaultTab = "upload" }: ImageSourceSelectorProps) {
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const [embedUrl, setEmbedUrl] = useState("");
	const [embedImage, setEmbedImage] = useState<string | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast.error("Please select a valid image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB");
			return;
		}

		const url = URL.createObjectURL(file);
		setUploadedImage(url);
		onImageSelect(url);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFileChange(file);
	};

	const handleEmbedInsert = () => {
		if (!embedUrl.trim()) return;

		try {
			new URL(embedUrl);
			setEmbedImage(embedUrl);
			onImageSelect(embedUrl);
		} catch {
			toast.error("Please enter a valid URL");
		}
	};

	const handleTabChange = (value: string) => {
		if (value === "upload" && uploadedImage) {
			onImageSelect(uploadedImage);
		} else if (value === "embed" && embedImage) {
			onImageSelect(embedImage);
		}
	};

	const clearUpload = () => {
		setUploadedImage(null);
	};

	const clearEmbed = () => {
		setEmbedImage(null);
		setEmbedUrl("");
	};

	const PreviewImage = ({ src, onClear }: { src: string; onClear: () => void }) => (
		<div className="relative">
			<img src={src || "/placeholder.svg"} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
			<Button
				variant="outline"
				size="sm"
				className="absolute border-none top-0 right-0 h-8 w-8 p-0 bg-transparent"
				onClick={onClear}
			>
				<X className="w-3 h-3" />
			</Button>
		</div>
	);

	return (
		<div className="w-full max-w-md mx-auto">
			<Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="upload" className="flex items-center gap-2">
						<Upload className="w-4 h-4" />
						Upload
					</TabsTrigger>
					<TabsTrigger value="embed" className="flex items-center gap-2">
						<Link className="w-4 h-4" />
						URL
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upload" className="space-y-4 min-h-[200px]">
					<div
						className={`relative border-2 border-dashed rounded-lg flex py-4 justify-center items-center text-center transition-colors ${
							isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						{uploadedImage ? (
							<PreviewImage src={uploadedImage} onClear={clearUpload} />
						) : (
							<div className="space-y-4">
								<Upload className="w-8 h-8 mx-auto text-muted-foreground" />
								<div>
									<p className="font-medium">Drop your image here</p>
									<p className="text-sm text-muted-foreground">or click to browse</p>
								</div>
								<Button variant="outline" onClick={() => fileInputRef.current?.click()}>
									Choose File
								</Button>
							</div>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
							className="hidden"
						/>
					</div>
					<Small className="text-muted-foreground mt-0">Note: Image size must be less than 5MB</Small>
				</TabsContent>

				<TabsContent value="embed" className="space-y-4 min-h-[200px] flex flex-col">
					<div className="flex gap-2">
						<Input
							value={embedUrl}
							onChange={(e) => setEmbedUrl(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleEmbedInsert()}
							placeholder="https://example.com/image.jpg"
							className="flex-1"
						/>
						<Button onClick={handleEmbedInsert} disabled={!embedUrl.trim()}>
							Insert
						</Button>
					</div>

					<div className="flex-1 flex items-center justify-center">
						{embedImage && <PreviewImage src={embedImage} onClear={clearEmbed} />}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
