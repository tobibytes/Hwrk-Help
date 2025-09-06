import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Video } from '@/components/ui/video';

const DocumentVideoPlayerCard: React.FC<{ videoUrl: string | null; thumbUrl: string | null }> = ({ videoUrl, thumbUrl }) => (
  <Surface variant="card" padding="lg">
    <Stack>
      {videoUrl ? (
        <Video src={videoUrl} poster={thumbUrl || undefined} />
      ) : (
        <div>No video yet. Click Build Media.</div>
      )}
    </Stack>
  </Surface>
);

export default DocumentVideoPlayerCard;

