// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assign_instructor_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignInstructorCommand extends AssignInstructorCommand {
  @override
  final String instructorUserId;
  @override
  final int expectedVersion;

  factory _$AssignInstructorCommand([
    void Function(AssignInstructorCommandBuilder)? updates,
  ]) => (AssignInstructorCommandBuilder()..update(updates))._build();

  _$AssignInstructorCommand._({
    required this.instructorUserId,
    required this.expectedVersion,
  }) : super._();
  @override
  AssignInstructorCommand rebuild(
    void Function(AssignInstructorCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AssignInstructorCommandBuilder toBuilder() =>
      AssignInstructorCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignInstructorCommand &&
        instructorUserId == other.instructorUserId &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssignInstructorCommand')
          ..add('instructorUserId', instructorUserId)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class AssignInstructorCommandBuilder
    implements
        Builder<AssignInstructorCommand, AssignInstructorCommandBuilder> {
  _$AssignInstructorCommand? _$v;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  AssignInstructorCommandBuilder() {
    AssignInstructorCommand._defaults(this);
  }

  AssignInstructorCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _instructorUserId = $v.instructorUserId;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignInstructorCommand other) {
    _$v = other as _$AssignInstructorCommand;
  }

  @override
  void update(void Function(AssignInstructorCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignInstructorCommand build() => _build();

  _$AssignInstructorCommand _build() {
    final _$result =
        _$v ??
        _$AssignInstructorCommand._(
          instructorUserId: BuiltValueNullFieldError.checkNotNull(
            instructorUserId,
            r'AssignInstructorCommand',
            'instructorUserId',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'AssignInstructorCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
