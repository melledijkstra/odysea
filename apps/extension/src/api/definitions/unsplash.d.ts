export type UnsplashExif = {
  make: string
  model: string
  exposure_time: string
  aperture: string
  focal_length: string
  iso: number
}

export type UnsplashLocation = {
  name: string
  city: string
  country: string
  position: {
    latitude: number
    longitude: number
  }
}

export type UnsplashUser = {
  id: string
  updated_at: string
  username: string
  name: string
  portfolio_url: string
  bio: string
  location: string
  total_likes: number
  total_photos: number
  total_collections: number
  instagram_username: string
  twitter_username: string
  links: {
    self: string
    html: string
    photos: string
    likes: string
    portfolio: string
  }
}

export type UnsplashResponse = {
  id: string
  created_at: string
  updated_at: string
  width: number
  height: number
  color: string
  blur_hash: string
  downloads: number
  likes: number
  liked_by_user: boolean
  description: string
  exif: UnsplashExif
  location: UnsplashLocation
  current_user_collections: [
    // The *current user's* collections that this photo belongs to.
    {
      id: number
      title: string
      published_at: string
      last_collected_at: string
      updated_at: string
      cover_photo: null
      user: null
    },
    // ... more collections
  ]
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  user: UnsplashUser
}
