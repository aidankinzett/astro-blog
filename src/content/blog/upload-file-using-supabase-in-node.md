---
title: "Upload a File with Supabase"
description: "How to upload a file using Supabase Storage in Node.js"
pubDate: "Feb 24 2024"
draft: false
toc: true
---

## Introduction

Supabase, the Firebase alternative, not only simplifies database management but also offers a robust solution for file storage. Supabase's SDK streamlines the process, ensuring your data is secure and easily accessible. This blog post will walk you through the steps of setting up the SDK and uploading files.

To get started setup a free project at [supabase.com](https://supabase.com). Then, create a storage bucket.

## Installation

Install using your preferred package manager. We will also be using the `nanoid` package to give the file a unique identifier.

```bash
yarn install @supabase/supabase-js nanoid
pnpm install @supabase/supabase-js nanoid
npm install @supabase/supabase-js nanoid
```

## Create a Client

Copy the `SUPABASE_URL` and `SUPABASE_PRIVATE_KEY` from the Supabase dashboard. 

The `SUPABASE_PRIVATE_KEY`, labelled as `service_role` in the dashboard, allows your backend to avoid Supabase's Row Level Security (RLS). In contrast to the `anon public` key it must never be shared publicly.

Create a new file `supabaseAdmin.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PRIVATE_KEY = process.env.SUPABASE_PRIVATE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

export default supabaseAdmin;
```

## Upload File

First we get the data we want to upload from the provided URL and convert it to an array buffer. Next we upload the file to the storage bucket, then use the returned path to get the public URL for the file.

```typescript
import supabaseAdmin from "./supabaseAdminClient";
import nanoid from "nanoid";

const BUCKET_NAME = "bucket-name";

/**
 * Uploads a file to Supabase storage.
 * @returns string The public URL to access the file
 */
const uploadFileFromURL = async (url: string) => {
  // fetch data to upload
  const dataResponse = await fetch(url);
  const dataBuffer = await dataResponse.arrayBuffer();

  // upload to supabase
  const { data: uploadData, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(nanoid(), imageBuffer, {
      contentType: "image/jpeg", // Adjust based on your files's content type
      upsert: false, // Set to true to overwrite existing files
    });

  // get public URL
  const { data: publicUrl } = supabaseAdmin.storage
    .from("book-covers")
    .getPublicUrl(uploadData?.path ?? "");

  return publicUrl.publicUrl;
};
```
