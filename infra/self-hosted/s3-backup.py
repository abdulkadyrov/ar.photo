#!/usr/bin/env python3
"""Snapshot the private S3 backend; credentials never appear in command arguments.

Requires boto3. Restore objects using the original keys and saved headers before
restoring the matching database. The snapshot intentionally includes old versions.
"""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys

import boto3
from botocore.config import Config


def snapshot(destination):
    credentials = json.loads(Path('/opt/ar-photo/supabase/.s3-beget.json').read_text())
    client = boto3.client(
        's3', endpoint_url=credentials['endpoint'], region_name='ru1',
        aws_access_key_id=credentials['accessKeyId'],
        aws_secret_access_key=credentials['secretAccessKey'],
        config=Config(signature_version='s3v4', s3={'addressing_style': 'path'}),
    )
    bucket = credentials['bucket']
    objects = [obj for page in client.get_paginator('list_objects_v2').paginate(Bucket=bucket)
               for obj in page.get('Contents', [])]
    destination.mkdir(mode=0o700, parents=True, exist_ok=False)
    needed = sum(obj['Size'] for obj in objects)
    if shutil.disk_usage(destination).free < needed + 2 * 1024**3:
        raise RuntimeError('Insufficient backup space (2 GiB reserve required)')

    def download(obj):
        key = obj['Key']
        target = (destination / 'objects' / key).resolve()
        if not target.is_relative_to((destination / 'objects').resolve()):
            raise ValueError('Unsafe object key')
        target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        response = client.get_object(Bucket=bucket, Key=key)
        digest = hashlib.sha256()
        size = 0
        with target.open('xb') as output:
            os.chmod(target, 0o600)
            for chunk in response['Body'].iter_chunks(chunk_size=1024**2):
                output.write(chunk)
                digest.update(chunk)
                size += len(chunk)
        if size != response['ContentLength']:
            raise RuntimeError('Incomplete S3 download')
        return {'key': key, 'bytes': size, 'sha256': digest.hexdigest(),
                'headers': {k: response[k] for k in
                            ('ContentType', 'CacheControl', 'ContentEncoding', 'Metadata')
                            if k in response}}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(download, objects))
    (destination / 'manifest.json').write_text(json.dumps(manifest))
    os.chmod(destination / 'manifest.json', 0o600)
    print(f'S3 snapshot: {len(manifest)} objects, {sum(o["bytes"] for o in manifest)} bytes')


if __name__ == '__main__':
    os.umask(0o077)
    snapshot(Path(sys.argv[1]).resolve())
