#!/usr/bin/env node
//@ts-nocheck
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export class CdkTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      "MyShopApp-OAI"
    );

    const s3Bucket = new s3.Bucket(this, "MyShopAppBucket", {
      bucketName: "02-serving-spa-bucket-ds-cdk",
    });

    s3Bucket.grantRead(cloudfrontOAI);

    const distribution = new cloudfront.Distribution(
      this,
      "MyShopApp-distribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(s3Bucket, {
            originAccessIdentity: cloudfrontOAI,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );
    new s3deploy.BucketDeployment(this, "MyShopAppBucket-Deployment", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: s3Bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "CloudFrontDomain", {
      value: distribution.distributionDomainName,
    });
  }
}
