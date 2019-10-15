#!/bin/bash
cd "./source"
rm -r ../blog/*
node ../generators/main.gen.js
