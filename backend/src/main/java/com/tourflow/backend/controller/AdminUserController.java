package com.tourflow.backend.controller;

import com.tourflow.backend.dto.AdminCreateUserRequest;
import com.tourflow.backend.dto.AdminUserResponse;
import com.tourflow.backend.service.AdminUserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;


    public AdminUserController(
            AdminUserService adminUserService
    ) {

        this.adminUserService =
                adminUserService;
    }


    @GetMapping
    public ResponseEntity<List<AdminUserResponse>>
    getUsers() {

        return ResponseEntity.ok(
                adminUserService.getUsers()
        );
    }


    @PostMapping
    public ResponseEntity<AdminUserResponse>
    createUser(
            @Valid
            @RequestBody
            AdminCreateUserRequest request
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        adminUserService
                                .createUser(
                                        request
                                )
                );
    }
}