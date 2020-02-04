#!/bin/bash
cd "./newsource"
rm -r ../newblog/*
node ../generators/main.gen.js
