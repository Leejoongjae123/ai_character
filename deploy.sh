#!/bin/bash

# 변수 설정
AWS_REGION="ap-northeast-2"  # 서울 리전
ECR_REPOSITORY="image-upload-service"
LAMBDA_FUNCTION_NAME="image-upload-service"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "ECR Repository: $ECR_REPOSITORY"
echo "Lambda Function: $LAMBDA_FUNCTION_NAME"

# ECR 로그인
echo "ECR에 로그인 중..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# ECR 리포지토리 생성 (이미 존재하면 무시)
echo "ECR 리포지토리 생성 중..."
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || echo "리포지토리가 이미 존재합니다."

# Docker 이미지 빌드
echo "Docker 이미지 빌드 중..."
docker build -t $ECR_REPOSITORY .

# 이미지 태그
echo "이미지 태그 설정 중..."
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# ECR에 푸시
echo "ECR에 이미지 푸시 중..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Lambda 함수 업데이트 또는 생성
echo "Lambda 함수 업데이트 중..."
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --image-uri $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest \
    --region $AWS_REGION 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Lambda 함수가 존재하지 않습니다. 새로 생성합니다..."
    
    # IAM 역할 생성 (기본 Lambda 실행 역할)
    aws iam create-role \
        --role-name lambda-execution-role \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }' 2>/dev/null || echo "역할이 이미 존재합니다."
    
    # 기본 Lambda 실행 정책 연결
    aws iam attach-role-policy \
        --role-name lambda-execution-role \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null
    
    # Lambda 함수 생성
    aws lambda create-function \
        --function-name $LAMBDA_FUNCTION_NAME \
        --role arn:aws:iam::$AWS_ACCOUNT_ID:role/lambda-execution-role \
        --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest \
        --package-type Image \
        --timeout 300 \
        --memory-size 1024 \
        --region $AWS_REGION
fi

# Function URL 생성 (API Gateway 없이 직접 호출 가능)
echo "Function URL 생성 중..."
aws lambda create-function-url-config \
    --function-name $LAMBDA_FUNCTION_NAME \
    --auth-type NONE \
    --cors '{
        "AllowCredentials": false,
        "AllowHeaders": ["*"],
        "AllowMethods": ["*"],
        "AllowOrigins": ["*"],
        "ExposeHeaders": ["*"],
        "MaxAge": 86400
    }' \
    --region $AWS_REGION 2>/dev/null || echo "Function URL이 이미 존재합니다."

# Function URL 조회
FUNCTION_URL=$(aws lambda get-function-url-config --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION --query FunctionUrl --output text 2>/dev/null)

echo "배포 완료!"
echo "Function URL: $FUNCTION_URL"
echo ""
echo "사용 예시:"
echo "curl -X POST \"$FUNCTION_URL/upload-with-presigned\" \\"
echo "  -F \"file=@your-image.png\" \\"
echo "  -F \"uploadUrl=your-presigned-url\"" 