package ast;

import java.util.ArrayList;

/**
 * @author GAO RISHENG A0101891L this class is mainly in charge of construction
 *         AST nodes that represents a for loop in programs
 *
 */
public class ASTForStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "For Statement";
	protected ArrayList<ASTStatement> statements;

	public ASTForStatement() {
		super();
	}

	// virtual method
	public String toSyntax() {
		this.result = "\n";
		return this.result;
	}

	public String typeof() {
		return super.typeof() + "->" + NODE_TYPE;
	}

	public String toTree(int indent) {
		StringBuilder sb = new StringBuilder("");
		for (int i = 0; i < indent; i++) {
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for (ASTStatement s : this.statements) {
			sb.append(s.toTree(indent + 1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
