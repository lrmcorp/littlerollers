// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SessionBranch extends SessionBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$SessionBranch([void Function(SessionBranchBuilder)? updates]) =>
      (SessionBranchBuilder()..update(updates))._build();

  _$SessionBranch._({
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  SessionBranch rebuild(void Function(SessionBranchBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionBranchBuilder toBuilder() => SessionBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class SessionBranchBuilder
    implements Builder<SessionBranch, SessionBranchBuilder> {
  _$SessionBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  SessionBranchBuilder() {
    SessionBranch._defaults(this);
  }

  SessionBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionBranch other) {
    _$v = other as _$SessionBranch;
  }

  @override
  void update(void Function(SessionBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionBranch build() => _build();

  _$SessionBranch _build() {
    final _$result =
        _$v ??
        _$SessionBranch._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'SessionBranch', 'id'),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'SessionBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'SessionBranch',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'SessionBranch',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
