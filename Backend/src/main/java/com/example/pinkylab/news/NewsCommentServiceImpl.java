package com.example.pinkylab.news;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.news.dto.request.comment.NewsCommentRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.comment.NewsCommentResponseDto;
import com.example.pinkylab.user.User;
import com.example.pinkylab.shared.exception.VsException;
import com.example.pinkylab.user.UserRepository;
import com.example.pinkylab.shared.security.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NewsCommentServiceImpl implements NewsCommentService {

    NewsCommentRepository newsCommentRepository;
    NewsRepository newsRepository;
    UserRepository userRepository;
    NewsCommentMapper newsCommentMapper;

    @Override
    public PaginationResponseDto<NewsCommentResponseDto> getCommentsByNewsId(UUID newsId,
            PaginationRequestDto request) {
        if (!newsRepository.existsById(newsId)) {
            throw new VsException(HttpStatus.NOT_FOUND, ErrorMessage.News.ERR_NEWS_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());
        Page<NewsComment> page = newsCommentRepository.findByNewsId(newsId, pageable);

        List<NewsCommentResponseDto> dtos = page.getContent()
                .stream()
                .map(newsCommentMapper::toResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                page.getTotalElements(),
                page.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, dtos);
    }

    @Override
    public NewsCommentResponseDto getCommentById(UUID id) {
        NewsComment comment = newsCommentRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsComment.ERR_COMMENT_NOT_FOUND));

        return newsCommentMapper.toResponseDto(comment);
    }

    @Override
    public NewsCommentResponseDto createComment(UUID newsId, NewsCommentRequestDto request) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.News.ERR_NEWS_NOT_FOUND));

        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.User.ERR_USER_NOT_EXISTED));

        NewsComment comment = newsCommentMapper.toEntity(request);
        comment.setNews(news);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());

        return newsCommentMapper.toResponseDto(newsCommentRepository.save(comment));
    }

    @Override
    public NewsCommentResponseDto updateComment(UUID id, NewsCommentRequestDto request) {
        NewsComment comment = newsCommentRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsComment.ERR_COMMENT_NOT_FOUND));

        UUID userId = SecurityUtils.getCurrentUserId();
        if (!comment.getUser().getId().equals(userId)) {
            throw new VsException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa bình luận này");
        }

        newsCommentMapper.updateEntityFromDto(request, comment);
        return newsCommentMapper.toResponseDto(newsCommentRepository.save(comment));
    }

    @Override
    public CommonResponseDto deleteComment(UUID id) {
        NewsComment comment = newsCommentRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsComment.ERR_COMMENT_NOT_FOUND));

        newsCommentRepository.delete(comment);
        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.NewsComment.DELETE_COMMENT_SUCCESS);
    }
}
