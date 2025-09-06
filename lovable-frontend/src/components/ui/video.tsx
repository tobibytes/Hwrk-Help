import React from 'react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  ratio?: number; // aspect ratio, default 16/9
  containerClassName?: string;
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ className, containerClassName, ratio = 16 / 9, controls = true, ...props }, ref) => {
    return (
      <div className={cn('w-full overflow-hidden rounded-md', containerClassName)}>
        <AspectRatio ratio={ratio}>
          <video
            ref={ref}
            className={cn('h-full w-full bg-black', className)}
            controls={controls}
            {...props}
          />
        </AspectRatio>
      </div>
    );
  }
);

Video.displayName = 'Video';

export { Video };
