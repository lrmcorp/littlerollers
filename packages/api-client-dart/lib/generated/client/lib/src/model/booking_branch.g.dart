// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingBranch extends BookingBranch {
  @override
  final String id;
  @override
  final String name;
  @override
  final String timezone;

  factory _$BookingBranch([void Function(BookingBranchBuilder)? updates]) =>
      (BookingBranchBuilder()..update(updates))._build();

  _$BookingBranch._({
    required this.id,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  BookingBranch rebuild(void Function(BookingBranchBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingBranchBuilder toBuilder() => BookingBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingBranch &&
        id == other.id &&
        name == other.name &&
        timezone == other.timezone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingBranch')
          ..add('id', id)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class BookingBranchBuilder
    implements Builder<BookingBranch, BookingBranchBuilder> {
  _$BookingBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  BookingBranchBuilder() {
    BookingBranch._defaults(this);
  }

  BookingBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _timezone = $v.timezone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingBranch other) {
    _$v = other as _$BookingBranch;
  }

  @override
  void update(void Function(BookingBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingBranch build() => _build();

  _$BookingBranch _build() {
    final _$result =
        _$v ??
        _$BookingBranch._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'BookingBranch', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'BookingBranch',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'BookingBranch',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
