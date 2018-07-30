# Frobnicator release

## Version info ~> info

This workflow will guide you through the release process of **Frobnicator**.

* Enter the version number you want to release ~> version

## Get the source code ~> clone

Clone the fresh copy of the Frobnicator repository:

```
$ git clone git@github.com:johndoe/frobnicator.git
$ cd frobnicator
```

Make sure it still builds and tests pass:

```
$ ./autogen.sh
$ ./configure
$ make dist
```

## Bump the ABI version ~> abi: clone

Open `frobnicator.h` in the editor and modify the ABI version number as follows:

* If there was no change to the API.
  * Keep `FROB_CURRENT` and `FROB_AGE` unchanged.
  * Increase `FROB_REVISION` by one.
* If functions were added to the API but the old ones weren't changed.
  * Increase `FROB_CURRENT` and `FROB_AGE` by one.
  * Set `FROB_REVISION` to zero.
* If there was a non-backward-compatible API change.
  * Increase `FROB_CURRENT` by one.
  * Set `FROB_AGE` and `FROB_REVISION` to zero.

Commit the change to GitHub:

```
$ git add frobnicator.h
$ git commit -s -m "Bump ABI version"
$ git push origin master
```

## Create a release tag ~> tag: info abi

Create a release tag and push it to GitHub:

```
$ git tag -a #{version}
$ git push origin #{version}
```

## Build the package ~> build: tag

Build the package:

```
$ make distclean
$ make dist
```

You should now see file `frobnicator-#{version}.tar.gz` in the current
directory.

## Compute the checksum ~> checksum: build

Compute the checksum of the package like this:

```
$ sha1sum frobnicator-#{version}.tar.gz
```

* Enter the checksum here: ~> checksum

## Upload the package to GitHub Pages ~> upload: build

To make the package accessible to the users you have to add it to `gh-pages`
branch. The branch contains the website and is served via GitHub pages.

```
$ git checkout gh-pages
$ git add frobnicator-#{version}.tar.gz
$ git commit -s -m "Package #{version} added"
$ git push origin gh-pages
```

## Edit the website ~> website: upload checksum

Open file `download.md` and add the new version. The entry should look something
like this:

```
### Frobnicator #{version}

Download: <frobnicator-#{version}.tar.gz>
Checksum: #{checksum}

... comment on changes in this version here ...
```

Regenerate the website:

```
$ ./regenereate.sh
```

Push the changes to GitHub pages:

```
$ git add -u
$ git commit -s -m "Website regenerated for version #{version}"
$ git push origin gh-pages
```

### Announce the release ~> announce: website

Send an announcement email about the release to `frobnicator@freelists.org`.

