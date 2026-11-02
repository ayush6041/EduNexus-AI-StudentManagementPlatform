package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.HolidayRequest;
import com.ayush.SMS.DTO.Dtos.HolidayResponse;
import com.ayush.SMS.Entity.Holiday;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.HolidayRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HolidayService {

    private final HolidayRepo holidayRepo;
    private final AuditService audit;

    public HolidayService(HolidayRepo holidayRepo, AuditService audit) {
        this.holidayRepo = holidayRepo;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> list() {
        return holidayRepo.findAllByOrderByHolidayDateAsc().stream().map(Mappers::holiday).toList();
    }

    @Transactional
    public HolidayResponse create(HolidayRequest request) {
        Holiday holiday = new Holiday();
        holiday.setName(request.name().trim());
        holiday.setHolidayDate(request.date());
        holiday.setDescription(Mappers.clean(request.description()));
        holiday = holidayRepo.save(holiday);
        audit.log("HOLIDAY_ADDED", holiday.getName() + " on " + holiday.getHolidayDate());
        return Mappers.holiday(holiday);
    }

    @Transactional
    public void delete(Long id) {
        Holiday holiday = holidayRepo.findById(id).orElseThrow(() -> ApiException.notFound("Holiday not found"));
        holidayRepo.delete(holiday);
        audit.log("HOLIDAY_DELETED", holiday.getName());
    }
}
