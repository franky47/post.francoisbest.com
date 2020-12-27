import React from 'react'
import { Skeleton, SkeletonProps, AspectRatio, Image } from '@chakra-ui/react'

export interface OgImagePreviewProps extends SkeletonProps {
  loading: boolean
  src: string
}

export const OgImagePreview: React.FC<OgImagePreviewProps> = ({
  loading,
  src,
  ...props
}) => {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <Skeleton speed={loading ? 0.8 : 0} isLoaded={!!src && loaded} {...props}>
      <AspectRatio ratio={1200 / 630}>
        <Image
          src={src}
          rounded="sm"
          shadow="md"
          onLoad={() => setLoaded(true)}
        />
      </AspectRatio>
    </Skeleton>
  )
}
