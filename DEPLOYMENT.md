# 🚀 Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Steps**:
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables:
   - `GEMINI_API_KEY`
4. Deploy!

**Auto-deploys on push to main branch**

---

### 2. Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Steps**:
1. Connect GitHub repository
2. Add environment variables
3. Railway auto-detects Next.js
4. Deploy

**Cost**: ~$5/month with free tier available

---

### 3. Netlify

```bash
npm run build
netlify deploy --prod
```

**Setup**:
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Init: `netlify init`
4. Add environment variables in Netlify dashboard
5. Deploy: `netlify deploy --prod`

---

### 4. Docker (Self-Hosted)

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build & Run**:
```bash
docker build -t docuextract .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  docuextract
```

---

## Environment Variables

Required for all deployments:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Optional:
```bash
DATABASE_URL=postgresql://... # For persistent storage
REDIS_URL=redis://... # For job queues
```

---

## Post-Deployment Checklist

- [ ] Verify Gemini API key is set
- [ ] Test file upload
- [ ] Test extraction with sample PDF
- [ ] Check metrics dashboard
- [ ] Verify export functionality
- [ ] Test error handling
- [ ] Monitor initial costs

---

## Monitoring

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Sentry** for error tracking
3. **LogRocket** for session replay
4. **Google Cloud Monitoring** for API usage

### Key Metrics to Track

- Upload success rate
- Extraction accuracy
- API costs per document
- Processing time
- Error rates

---

## Scaling Considerations

### Current Setup (Good for):
- Up to 10,000 documents/month
- Small to medium teams
- Development/testing

### To Scale Further:

1. **Database**
   - Add PostgreSQL for persistent storage
   - Implement proper session management

2. **Job Queue**
   - Add Redis + BullMQ
   - Process documents asynchronously
   - Better rate limit handling

3. **CDN**
   - Serve processed images from CDN
   - Cache extraction results

4. **Load Balancing**
   - Deploy multiple instances
   - Use load balancer

---

## Cost Optimization at Scale

### Current Approach
- Smart model routing
- Batch processing for 100+ docs

### Advanced Optimizations
1. Implement result caching
2. Deduplicate documents
3. Progressive quality enhancement
4. Scheduled batch processing

### Expected Costs

| Volume | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| 1K docs/mo | $12 | $4 | 67% |
| 10K docs/mo | $120 | $40 | 67% |
| 100K docs/mo | $1,200 | $400 | 67% |

---

## Security Considerations

### Implemented
✅ File type validation
✅ File size limits
✅ Input sanitization

### Recommended Additions
- [ ] Rate limiting per user
- [ ] Authentication (Auth0, Clerk, NextAuth)
- [ ] File encryption at rest
- [ ] Audit logging
- [ ] CORS configuration

---

## Troubleshooting

### Common Issues

**1. "Gemini API Error"**
- Check API key is set correctly
- Verify API key has credits
- Check rate limits

**2. "PDF Upload Fails"**
- Verify file size < 10MB
- Check file is valid PDF
- Try different browser

**3. "Processing Stuck"**
- Check browser console for errors
- Verify API endpoint is reachable
- Try refreshing page

**4. "Export Not Working"**
- Check browser allows downloads
- Verify data exists
- Try different export format

---

## Support

For issues or questions:
- GitHub Issues: [repository]/issues
- Email: your.email@example.com
- Documentation: README.md

---

**Built with ❤️ for production use**
