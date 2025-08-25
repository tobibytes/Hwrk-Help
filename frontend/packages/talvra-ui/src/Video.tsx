import React from 'react';

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
}

export function Video({ src, poster, ...rest }: VideoProps) {
  return (
    <video src={src} poster={poster} controls style={{ width: '100%', maxWidth: 800, borderRadius: 8 }} {...rest} />
  );
}
