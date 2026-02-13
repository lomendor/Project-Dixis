'use client';

import dynamic from 'next/dynamic';

const ProducerMap = dynamic(() => import('@/components/ProducerMap'), { ssr: false });

interface ProducerMapWrapperProps {
  latitude: number;
  longitude: number;
  name: string;
  region?: string;
}

export default function ProducerMapWrapper(props: ProducerMapWrapperProps) {
  return <ProducerMap {...props} />;
}
