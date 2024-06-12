#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkTsStack } from "../lib/cdk-ts-stack";

const app = new cdk.App();

new CdkTsStack(app, "MyShopApp");

