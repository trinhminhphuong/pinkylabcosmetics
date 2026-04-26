package com.example.pinkylab.shared.dto.pagination;

import java.util.UUID;

import com.example.pinkylab.shared.constant.CommonConstant;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaginationRequestDto {

  @Parameter(description = "Page you want to retrieve (0..N)")
  Integer pageNum = CommonConstant.ONE_INT_VALUE;

  @Parameter(description = "Number of records per page.")
  Integer pageSize = CommonConstant.PAGE_SIZE_DEFAULT;

  @Parameter(description = "Filter by category ID (optional)")
  UUID categoryId;

  @Parameter(description = "Filter by brand ID (optional)")
  UUID brandId;

  @Parameter(description = "Search keyword for product name (optional)")
  String keyword;

  public int getPageNum() {
    if (pageNum < 1) {
      pageNum = CommonConstant.ONE_INT_VALUE;
    }
    return pageNum - 1;
  }

  public int getPageSize() {
    if (pageSize < 1) {
      pageSize = CommonConstant.PAGE_SIZE_DEFAULT;
    }
    return pageSize;
  }
}
