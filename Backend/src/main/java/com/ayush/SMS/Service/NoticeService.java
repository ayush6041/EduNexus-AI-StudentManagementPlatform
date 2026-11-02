package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.NoticeRequest;
import com.ayush.SMS.DTO.Dtos.NoticeResponse;
import com.ayush.SMS.Entity.Notice;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.NoticeRepo;
import com.ayush.SMS.Security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepo noticeRepo;
    private final ClassService classService;
    private final AuditService audit;

    public NoticeService(NoticeRepo noticeRepo, ClassService classService, AuditService audit) {
        this.noticeRepo = noticeRepo;
        this.classService = classService;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> list() {
        return noticeRepo.findAllByOrderByCreatedAtDesc().stream().map(Mappers::notice).toList();
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> visibleToClass(Long classId) {
        return noticeRepo.findVisibleToClass(classId).stream().map(Mappers::notice).toList();
    }

    @Transactional
    public NoticeResponse create(NoticeRequest request) {
        Notice notice = new Notice();
        notice.setTitle(request.title().trim());
        notice.setBody(request.body().trim());
        notice.setClassSection(request.classId() == null ? null : classService.require(request.classId()));
        notice.setCreatedBy(CurrentUser.actor());
        notice = noticeRepo.save(notice);
        audit.log("NOTICE_POSTED", notice.getTitle());
        return Mappers.notice(notice);
    }

    @Transactional
    public void delete(Long id) {
        Notice notice = noticeRepo.findById(id).orElseThrow(() -> ApiException.notFound("Notice not found"));
        noticeRepo.delete(notice);
        audit.log("NOTICE_DELETED", notice.getTitle());
    }
}
