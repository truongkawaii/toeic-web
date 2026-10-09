import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DictationView } from "@/components/learning/dictation-view";
export const metadata:Metadata={title:"Nghe chép YTS"};
export default async function Page({params}:{params:Promise<{testId:string}>}) {
  const {testId}=await params;
  if (!testId.startsWith("ybm2025-")) notFound();
  return <Suspense fallback={<div className="container-app skeleton h-96" />}><DictationView testId={testId} /></Suspense>;
}
